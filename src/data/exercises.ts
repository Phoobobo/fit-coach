/**
 * 动作库。新增动作只改这个文件，然后重新构建。
 * 数组第一项会作为首页主视觉。
 *
 * 视频文件不在仓库里：本地放到 /videos，服务器放到 /srv/fit/videos。
 * /videos/* 在服务器上缓存 7 天，更换 mp4 后把 videoVersion 加 1。
 */

export type Difficulty = '初级' | '中级' | '高级'

export interface Exercise {
  /** 地址 /exercise/<id>/ ，只使用小写英文、数字和短横线 */
  id: string
  /** 名称 */
  name: string
  /** 目标肌群 */
  muscles: string
  /** 难度 */
  difficulty: Difficulty
  /** 建议组数/次数 */
  prescription: string
  /** 动作要点，3 到 5 条 */
  cues: string[]
  /** 常见错误 */
  mistakes: string[]
  /** 例如 /videos/crunch.mp4 */
  video: string
  /** 输出为 ?v=<videoVersion>，用于冲掉 7 天缓存 */
  videoVersion: number
  /** 海报图路径。留空表示不使用海报，加载前显示藕粉色底 */
  poster: string
}

export const exercises: Exercise[] = [
  {
    id: 'crunch',
    name: '卷腹',
    muscles: '腹直肌（上腹）',
    difficulty: '初级',
    prescription: '3 组 × 12–15 次，组间休息 45–60 秒',
    cues: [
      '仰卧屈膝，双脚踩实，与髋同宽，腰椎轻轻贴住垫面。',
      '双手轻贴耳侧，下颌微收，眼睛看向膝盖上方，不要用手拉头。',
      '呼气，肋骨向骨盆收拢，只把肩胛抬离垫子，下背不要跟着起来。',
      '最高点停约一秒，感受上腹收紧，再吸气、慢慢落下。',
    ],
    mistakes: [
      '抱头向前拽，脖子发酸。',
      '抬得太高，做成仰卧起坐，髋屈肌在代偿。',
      '腰离开垫子，或靠甩动、弹振凑次数。',
      '憋气，顶点一晃而过。',
    ],
    video: '/videos/crunch.mp4',
    videoVersion: 2,
    poster: '',
  },
  {
    id: 'side-crunch',
    name: '侧卷腹',
    muscles: '腹外斜肌、腹内斜肌',
    difficulty: '初级',
    prescription: '每侧 3 组 × 12–15 次，组间休息 45–60 秒',
    cues: [
      '侧卧，双膝弯曲并向前叠好，下方手臂屈肘托住头部。',
      '骨盆保持稳定，不要往前或往后翻。',
      '呼气，用靠垫子这一侧的腹斜肌把上半身侧向抬起，肋骨朝同侧髋部靠。',
      '幅度不用大，停约一秒再缓慢放下。一侧做完再换边。',
    ],
    mistakes: [
      '用手把脖子拽起来，侧腰却没用上。',
      '身体前后滚动，做成了转体。',
      '借惯性甩起肩膀，放下时砸回垫子。',
      '两侧次数和幅度差很多。',
    ],
    video: '/videos/side-crunch.mp4',
    videoVersion: 2,
    poster: '',
  },
  {
    id: 'russian-twist',
    name: '俄罗斯转体',
    muscles: '腹斜肌',
    difficulty: '中级',
    prescription: '3 组 × 每侧 10–12 次，组间休息 45–60 秒',
    cues: [
      '坐于垫上，屈膝，双脚平放，与髋同宽。',
      '上身向后倾到能挺直腰背的角度，大约 45 度，不要含胸弓腰。',
      '双手合于胸前。呼气，用胸廓带动躯干转向一侧，髋部尽量保持朝前。',
      '稍作停顿，吸气回到正中，再转向另一侧。由腰腹控制，不要甩手臂。',
    ],
    mistakes: [
      '只有头和手臂在动，肋骨几乎没转。',
      '圆背塌腰，靠拧腰椎来完成。',
      '髋部跟着左右倒，变成晃身子。',
      '越转越快并憋气。脚若抬起后腰不稳，就放回地面。',
    ],
    video: '/videos/russian-twist.mp4',
    videoVersion: 2,
    poster: '',
  },
]

const DIFFICULTY: readonly Difficulty[] = ['初级', '中级', '高级']

function validate(list: Exercise[]): void {
  if (list.length === 0) {
    throw new Error('至少需要一个动作')
  }
  const ids = new Set<string>()
  for (const ex of list) {
    if (!/^[a-z0-9-]+$/.test(ex.id)) {
      throw new Error(`动作 id 不合法: ${ex.id}`)
    }
    if (ids.has(ex.id)) {
      throw new Error(`动作 id 重复: ${ex.id}`)
    }
    ids.add(ex.id)
    if (!ex.name.trim() || !ex.muscles.trim() || !ex.prescription.trim()) {
      throw new Error(`动作文案不完整: ${ex.id}`)
    }
    if (!DIFFICULTY.includes(ex.difficulty)) {
      throw new Error(`难度不合法: ${ex.id}`)
    }
    if (ex.cues.length < 3 || ex.cues.length > 5 || ex.cues.some((cue) => !cue.trim())) {
      throw new Error(`动作要点需为 3 到 5 条: ${ex.id}`)
    }
    if (ex.mistakes.length < 1 || ex.mistakes.some((item) => !item.trim())) {
      throw new Error(`常见错误不能为空: ${ex.id}`)
    }
    if (!/^\/videos\/[a-z0-9-]+\.mp4$/.test(ex.video)) {
      throw new Error(`视频路径需为 /videos/<name>.mp4: ${ex.id}`)
    }
    if (!Number.isInteger(ex.videoVersion) || ex.videoVersion < 0) {
      throw new Error(`videoVersion 需为非负整数: ${ex.id}`)
    }
    if (ex.poster !== '' && !/^\/[A-Za-z0-9._/-]+$/.test(ex.poster)) {
      throw new Error(`海报路径不合法: ${ex.id}`)
    }
  }
}

validate(exercises)
