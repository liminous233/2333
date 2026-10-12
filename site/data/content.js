/*
 * 圣献唱诗院 · 调查档案 —— 全站文案
 * 改文字只改这个文件。
 *
 * 写法约定：
 *   - 段落之间空一行（\n\n）
 *   - **加粗** 用两个星号包起来
 *   - note：维的手写批注
 *
 * 换成自己的图片素材：
 *   把图片放进 site/assets/img/，然后在对应条目的 image（或 photo / sunImage）里填路径，
 *   例如 image: 'assets/img/ev-candle.png'。留空 '' 就继续用代码画的线稿。
 */
window.CONTENT = {

  site: {
    title: '圣献唱诗院',
    titleEn: 'CATHARSIS CHOIR',
    caseNo: 'CASE FILE 0110',
    // 背景音乐路径，例如 'assets/audio/hymn.mp3'。留空则使用合成的低持续音。
    music: '',
  },

  nav: [
    { route: 'home',      num: '0',   en: 'PROLOGUE',  zh: '导语' },
    { route: 'map',       num: 'I',   en: 'THE GROUNDS', zh: '唱诗院地图' },
    { route: 'journal',   num: 'II',  en: 'EIGHT DAYS', zh: '八日日志' },
    { route: 'evidence',  num: 'III', en: 'EVIDENCE',  zh: '证物柜' },
    { route: 'rules',     num: 'V',   en: 'THE RULES', zh: '游客守则' },
    { route: 'missing',   num: 'VI',  en: 'MISSING',   zh: '失踪档案' },
  ],

  ui: {
    stages: ['清醒', '微恙', '安宁', '至臻'],
    meterLabel: 'ASSIMILATION',
    leave: '离开唱诗院',
    leaveConfirm: '离开唱诗院将清除所有进度：同化值、拿过的物件、读过的日志。\n\n确定离开吗？',
    music: '颂歌',
    locked: '未解封',
    close: '关闭',
  },

  // 0. 门禁 · 工作证
  // 维的桌面档案夹：左边白纸是欢迎信，右边黑板上放着证件、枪、线索便签、蘸水笔、半张牛皮纸。
  // 物件点一下拿起来看，再点空白处放回去。
  gate: {
    kicker: 'CASE FILE 0110 · RESTRICTED',
    photo: '',          // 证件照，例如 'assets/img/wei.png'；留空就是一块纯黑

    // ---- 调查局证件（正面仿 FBI 证件版式）
    card: {
      bureau: 'SERAVIA INVESTIGATION BUREAU',
      ministry: 'SERAVIA MINISTRY OF JUSTICE',
      subordinate: 'Subordinate to the Seravia Ministry of Justice',
      watermark: 'FBI',             // 证件正面的大水印字母（按要求暂不改）
      lineA: 'WHOSE SIGNATURE AND PHOTOGRAPH APPEAR HEREON IS A REGULAR APPOINTED',
      title: 'POLICE OFFICER',
      lineB: 'OF THE SERAVIA INVESTIGATION BUREAU, SERAVIA MINISTRY OF JUSTICE',
      fields: [
        ['CODENAME', '0110'],
        ['IDENTIFICATION NO.', '∞'],
        ['DEPARTMENT', 'Seravia Intelligence Department'],
        ['TITLE', 'police officer'],
      ],
      // 背面
      back: 'The bearer is hereby commissioned to investigate unlawful acts within Seravia, to gather evidence in cases wherein the Investigation Bureau is, or may become, an interested party, and to discharge such other duties as the law confers upon him.',
      signer: 'Chief Justiciar',
      order: 'BY ORDER OF: THE CHIEF JUSTICIAR OF SERAVIA',
      issued: 'ISSUED —— · VALID UNTIL ∞',
      signatureLabel: 'SIGNATURE',
      flipHint: '点击或拖动翻面',
    },

    // ---- 左边白纸：欢迎信。鼠标停留会慢慢融化，1.5 秒后闪回中文原稿 1 秒
    // 段落越往后越"坏"；落款永远清晰。
    letter: {
      title: 'Welcome to the Bureau!',
      greeting: 'Dear Officer 0110,',
      body: [
        'On behalf of everyone at the Seravia Investigation Bureau, it is my great pleasure to welcome you to our team. We are so very glad to have you with us.',
        'Your first day begins at 9:00 a.m. with a briefing in the Bureau’s main hall, followed by a tour of the Bureau and… a visit to the Choir of Sacred Offering. We will prepare for you — refreshments, refreshments, silver, silver? white candles. It is a tradition we hold very dear.',
        'Should you have any questions, any questions, any questions, any questions, please do not hesitate, hesitate, hesitate, hes— to ask. We look forward, forward, for-forw— to working beside you.',
      ],
      closing: 'Yours faithfully,',
      signature: 'The Chief Justiciar',
      signOff: 'Seravia Investigation Bureau',
      // 闪回的中文原稿
      zh: {
        title: '欢迎加入调查局！',
        greeting: '亲爱的 0110 警员：',
        body: [
          '谨代表塞拉维亚调查局全体热烈欢迎你加入我们的团队。我们非常高兴能有您加入。',
          '您的第一天将于上午 9 点开始，在调查局主厅参加简报会，随后参观调查局并……来到圣献唱诗院。我们将为您准备——茶点，茶点，银，银？白色香烛。这是我们十分珍视的传统。',
          '如果您有任何疑问，任何疑问，任何疑问，任何疑问，请随时提出，提出，提出，提。我们期待，期待，期期期期。与您并肩工作。',
        ],
        closing: '此致',
        signature: '审判长',
        signOff: '塞拉维亚调查局',
      },
      // 揉成团再展开，里面是它自己藏的另一版
      hidden: "DON'T COME.",
      hint: '按住揉成一团',
    },

    // ---- 克莱因蓝便签
    note: 'Good luck with the investigation.',

    // ---- 线索便签（手写、做旧）
    clue: [
      'The scent of the candles reminds me of an old friend…',
      'Perhaps he has already set out upon the Path of Purification.',
    ],

    // ---- 半张牛皮纸（另一半 "Forever" 以后放在别的角色页）
    kraft: 'WE',

    objects: {
      card:  { en: 'INVESTIGATION BUREAU ID', zh: '调查局证件' },
      gun:   { en: 'SERVICE REVOLVER', zh: '银色左轮' },
      clue:  { en: 'NOTE · UNKNOWN HAND', zh: '线索便签' },
      pen:   { en: 'OBLIQUE DIP PEN', zh: '银色斜口蘸水笔' },
      kraft: { en: 'TORN KRAFT PAPER', zh: '半张牛皮纸' },
      putBack: '放回',
    },

    button: 'AUTHENTICATE',
    checking: '正在核对持证人……',
    success: '权限确认。欢迎回来，0110。档案已解封。',
    easterEgg: 'MIRROR-HOLDER · WORLD: SACRED CHOIR · ROLE: INVESTIGATION · TIME LIMIT: 8 DAYS',
  },

  // 1. 首页
  home: {
    titleA: 'Game',
    titleB: 'Start',
    startRoute: 'map',            // 点 Game Start 去哪：'map' 地图 / 'journal' 八日日志月相页
    startHint: '进入唱诗院',
    titleEn: 'THE CHOIR OF SACRED OFFERING',   // 圣献唱诗院的英文名，可改
    // 左半边底图（半透明）。现在是你给的穹顶参考图做占位，正式上线前换成 GPT 生成的图
    bgImage: 'assets/img/dome-placeholder.jpg',
    // 右边卡片下面压着的银莲花（已去色 + 同心圆实色混合）。留空则用代码画的线稿花
    flowersImage: 'assets/img/anemone-rings.png',
    // 去色但没叠同心圆的版本：鼠标经过时闪出来
    flowersAltImage: 'assets/img/anemone-plain.png',
    panels: {
      days: 'EIGHT DAYS',
      daysZh: '八日日志',
      files: 'FILES',
      filesZh: '档案',
      desk: 'STATUS',
      deskZh: '状态',
      credits: 'CREDITS',
      creditsZh: '致谢',
    },
    // 首页「致谢」小块：图片署名（上线必须保留）
    credits: [
      ['作者', '翎 · liminous（世界观、剧情文案、页面设计与排版、素材）'],
      ['代码', 'Claude · 克（按翎的设计方案实现）'],
      ['枪', 'Gordon Gartrell · CC BY-SA 2.0 · Wikimedia Commons'],
      ['祈祷室围墙', '小红书 @Jyuemim'],
      ['黑日', '小红书 @無山'],
      ['交互参考', 'React Bits（翻转卡、揉纸、打乱文字、可变邻近、像素交换）'],
    ],
    kicker: 'A JOURNEY THROUGH THE EIGHT DAYS OF THE GREAT HYMN',
    // 左下角花体字（7 人 · 调查组 2 · 信徒组 1 的缩写）
    partySign: '7c.2p.1e',
    partyHint: '共 7 人：4 游客、2 调查员、1 邪信徒',
    // 唱片上螺旋排列的哥特体文字（只能用英文/拉丁字母，Aktura 字体没有中文）。不够长会自动重复
    discText:
      'The Sacred Choir of Offering is a renowned sanctuary of soul healing, where hymns are said to wash the sins from the heart. ' +
      'As the great annual Hymn draws near, believers and travellers gather here in search of inner peace. ' +
      'Light the holy white candle. Let the drifting incense and the sacred song lift the weariness of the world and the burden of feeling from you, ' +
      'and lead your soul into a stillness without stain. ' +
      '✦ Blessed are they who forget, for the moonlight remembers in their stead. ' +
      '✦ Two moons, one mercy. Two moons, one mouth. ' +
      '✦ Do not count the candles. The candles are counting you. ' +
      '✦ Sing the second verse. There are no words in the second verse. Follow. ' +
      '✦ Mother of white petals, take our taste, take our tears, take our names and keep them in wax. ' +
      '✦ Whoever is still afraid has not yet been loved enough. ' +
      '✦ We were fourteen. We are eleven. We are light. ' +
      '✦ Eight days, and the door does not open outward. ' +
      '✦ Kyrie, catharsis. Christe, catharsis. Kyrie, catharsis. ' +
      '✦ Hush now. The choir is breathing for you.',
    hubText: 'CASE FILE 0110 ✦ CATHARSIS CHOIR ✦ SIDE A ✦ EIGHT DAYS ✦ ',
    intro:
      '圣献唱诗院是著名的灵魂疗愈圣地，宣称通过颂歌仪式可以洗涤心灵的罪孽。随着唱诗院一年一度的大颂礼将近，大量信教者以及游客被吸引前来寻求内心的平静。\n\n' +
      '点燃神圣的白色香烛，在这里，飘渺的灵烟与神圣的颂歌或许能洗去您尘世的疲惫与情感的负累，引领您的灵魂抵达无垢的宁静之境。',
    note: '宣传册写得真好。好到我开始算这一本印刷成本多少钱了。',
    meta: [
      ['LOCATION', '创造域 · 边域分支级子世界'],
      ['TYPE', '规则怪谈'],
      ['TIME LIMIT', '8 DAYS'],
      ['PARTY', '7 · 调查组 2 / 游客组 4 / 信徒组 1'],
    ],
  },

  // 2. 地图（方块地图：外圈黑 → 内圈白，中间方块拼出来的圆是银莲花田，正中是圣堂）
  map: {
    // 右边的欢迎语：中文在上，英文在下
    welcome: {
      zh: ['欢迎到来', '愿您安宁，愿神护佑您。'],
      en: ['Welcome.', 'May you find peace; may the Divine keep you.'],
    },
    // 地图下面的按钮：英文在上（大字），中文在下（小字）。点了进八日日志
    candle: { en: 'Light the Candle', zh: '点燃香烛' },

    // 房间：col / row 是地图格子坐标（19 × 19，左上角是 0,0），w / h 是占几格
    // action 留空的房间只有悬停效果
    rooms: [
      { id: 'studio',    zh: '工作室', en: 'STUDIO',           col: 2,  row: 2,  w: 3, h: 2, action: 'studio' },
      { id: 'gate',      zh: '大门',   en: 'THE GATE',         col: 8,  row: 1,  w: 3, h: 2, action: 'gate' },
      { id: 'dining',    zh: '餐厅',   en: 'REFECTORY',        col: 14, row: 2,  w: 3, h: 2, action: 'dining' },
      { id: 'hall',      zh: '会议厅', en: 'CHAPTER HALL',     col: 1,  row: 8,  w: 3, h: 2, action: 'hall' },
      { id: 'chapel',    zh: '祈祷室', en: 'ORATORY · CHAPEL', sub: '小礼拜堂', col: 15, row: 8, w: 3, h: 2, action: 'chapel' },
      { id: 'dorm',      zh: '居室',   en: 'DORMITORY',        col: 2,  row: 15, w: 3, h: 2, action: 'dorm' },
      { id: 'bell',      zh: '钟楼',   en: 'BELL TOWER',       sub: '档案馆', col: 8, row: 16, w: 3, h: 2, action: 'bell' },
      { id: 'parlour',   zh: '会客室', en: 'PARLOUR',          col: 14, row: 15, w: 3, h: 2, action: 'parlour' },
      { id: 'cathedral', zh: '卡塔西斯圣堂', en: 'CATHARSIS',  col: 8,  row: 8,  w: 3, h: 3, action: 'cathedral' },
      { id: 'field',     zh: '银莲花田', en: 'ANEMONE FIELD',  col: 12, row: 9,  w: 2, h: 1, action: 'field' },
    ],

    // 数值全部暗中计分，不显示（地图页补充，docs/specs/2b）
    gate: {
      image: 'assets/img/map/gate.webp',
      reportImage: 'assets/img/map/gate-day7.png',
      text: 'DAY1.祂的世界',
      assim: 1,
    },
    dorm: {
      image: 'assets/img/map/dorm.webp',
      text: '入夜，跟随队伍来到居室。',          // 点这句话，下面才弹出选项
      wander: '游荡', wanderText: '你在尽头的休息厅茶几下找到一张撕了一半的牛皮纸。', got: '获得「forever」×1',
      wanderClarity: 8,                           // 捡到的半张纸放进手提箱（证物柜），和「WE」拼合时同化值 +5
      enter: '进屋', enterText: '钟声敲响，遁入梦乡。', enterAssim: 1,
      report: {
        text: '所有人行色匆匆，游客聚集在正厅想要离开，被修女镇压。',
        view: '查看消息', leave: '离开',
        messages: [
          { tone: 'black', text: '无需担心，正常流程' },
          { tone: 'blue', text: '你干的好事。' },
          { tone: 'black', text: '拭目以待' },
        ],
      },
    },
    studio: '筹办大颂礼的重要场所，游客免入。',
    field: '禁止踩踏花坪。',
    parlour: '你作为初来乍到的游客没有被邀请。',
    hall: '若你的职务达到参议员往上即可进入。',    // 暂时进不了（参议员线不做）
    chapel: {
      image: 'assets/img/map/chapel.webp',
      text: ['唱诗院的老人们平日会来到这里。', '你踏入此地，无人望向你。'],
      pray: '做礼拜', prayText: '月光短暂地注视了你。', prayAssim: 2,
      // 逛逛 → 看见神父（白发的年轻神父就是莱恩）→ 向外走去 → 围墙图
      walk: '逛逛', walkText: '看见白发的年轻神父穿梭座次，偶有几位修女寻他解惑。',
      out: '向外走去', outText: '建筑后是极高的围墙，似乎隔绝了两个世界。', walkClarity: 1,
      walkImage: 'assets/img/map/chapel-wall.webp',
      walkCredit: '图片来源：小红书 @Jyuemim',
      leave: '离开', leaveText: '月光饶有兴致地瞥视了你。', leaveAssim: 8,
      // 地图异动后（flag d4Report）：DAY 6 版本，图和文案都换掉；按钮和流程不变，没写的沿用上面
      day6: {
        label: 'DAY 6',
        image: 'assets/img/map/chapel-day6.webp',
        text: ['老人们的座位空了大半。', '你踏入此地，有人回过头来凝视你。'],
        enterAssim: -5,                   // 进门同化值 -5（只第一次）
        prayText: '这次没有注视加诸你身，只有窗外透下一圈暗红的光晕洒在你的面庞。',
        walkText: '曾经的白发神父一路升职为五大主教之一，他事务繁忙，再无他的身影。',
        outText: '围墙脚下落满了红色的花瓣，墙的另端隐约传来令人躁动的呓语。',
        walkImage: 'assets/img/map/chapel-wall-day6.webp',
        leaveText: '和别人一样行色匆匆？不，这只是一场游戏，而你只需等待结局。',
      },
    },
    bell: {
      image: 'assets/img/map/belltower.webp',
      up: '上楼',
      archive: '档案室', archiveText: '似乎锁门了。',
      gaze: '眺望', gazeText: '银莲花田簇拥着卡塔西斯圣堂，你的心中感到一阵安宁。',
      // DAY4 走了述职分支（点过「本次述职结束」，flag d4Report）之后：朋友给了钥匙，档案室能进了
      day5: {
        label: 'DAY 5',
        gazeText: '银莲花田与罂粟簇拥着卡塔西斯圣堂，你的心中感到一阵躁动。',
        upText: '…我的朋友利用职务之便给了我一把钥匙。',
        archiveText: '主教的私人藏书室',
        open: 'Open it',
        openText: '地面上散落着黑色的、看着不祥的太阳图案手稿。\n他感谢了我借给他笔的使用权限。',
      },
    },
    // 看过 DAY 5 之后点会议厅 → DAY 6；看过 DAY 6 之后点银莲花田 → DAY 7（都替换原来的小卡）
    day6: { label: 'DAY 6', text: '圣献唱诗院高层最近似乎变得人心浮动，大门进出人员频繁。' },
    day7: { label: 'DAY 7', text: '摇曳的白色海洋如今点缀零星红色…罂粟？' },
    dining: {
      image: 'assets/img/map/dining.webp',
      text: '还没到开饭的时间。',
      forward: '走到前方',
      // 平时：走到前方 → 女孩打招呼
      hi: '嗨',
      girlImage: 'assets/img/map/dining-girl.webp',
      girlText: '女孩？看着你，她对你打了个招呼。',
      // DAY4 述职分支走完（flag d4Report）后：走到前方 → DAY 7 双头羔羊桌布 + 融化文字
      label: 'DAY 7',
      clothImage: 'assets/img/map/dining-day7.jpg',
      clothText: '双头的羔羊桌布被布置在餐桌，无人知晓何时更换的样式。',
      leave: '离开餐厅',
    },
    cathedral: {
      image: 'assets/img/map/cathedral.webp',
      reportImage: 'assets/img/map/cathedral-day7.png',
      text: '天地间的纯白，我们的安宁。',
    },
    close: '关闭',
  },

  // 八天的月相（首页的月相弧在用）。日志原文已按方案 3 删掉
  // moon：月亮被照亮的比例（1 = 满月，0 = 新月，'double' = 双月重叠）
  days: [
    {
      day: 1, moon: 1, phase: '满月', place: '外围',
    },
    {
      day: 2, moon: 0.84, phase: '亏凸月', place: '入院',
    },
    {
      day: 3, moon: 0.66, phase: '下弦前', place: '圣乐聆演 I',
    },
    {
      day: 4, moon: 0.5, phase: '下弦月', place: '圣乐聆演 II',
    },
    {
      day: 5, moon: 0.3, phase: '残月', place: '圣物展出 I',
    },
    {
      day: 6, moon: 0.12, phase: '新月前', place: '圣物展出 II',
    },
    {
      day: 7, moon: 0, phase: '新月', place: '大弥撒前夜',
    },
    {
      day: 8, moon: 'double', phase: '双月重叠', place: '大弥撒',
    },
  ],

  // 3. 八日日志（方案 3）：全屏森林月相。顶上黑边正中一行扁长小字；
  // 月亮从右往左数 1–6，鼠标停 1 秒弹出选项。x / y 是月亮在图上的位置（百分比）
  journal: {
    title: 'GAZE UPON THE FIRMAMENT',          // "凝视天穹"
    hold: 1000,                                 // 停留多久弹出（毫秒）
    moons: [
      { n: 1, x: 78.1, y: 51.0, label: '前往证物柜', route: 'evidence' },
      { n: 2, x: 67.4, y: 53.3, label: '游客守则',   route: 'rules' },
      { n: 3, x: 55.3, y: 53.3, label: '唱诗院地图', route: 'map' },     // 守则和失踪档案都在手提箱里了，这里改成地图入口
      { n: 4, x: 44.8, y: 53.3, label: 'D4 日志',    route: 'd4' },
      { n: 5, x: 33.1, y: 53.2, label: '前往教堂',   route: 'church' },
      { n: 6, x: 20.6, y: 53.1, label: '', route: 'ending', twin: true },
    ],
    // 第六个（双月）：前五个没点完时，斜体小字晃动
    unfinished: '副本未完成',
    // 分结局：同化值 > endingAt 永归宁国，否则异神极乐
    // （以后：明晰 ≥ 35 时异神极乐里有个小彩蛋，用户到时候再说）
    endingAt: 50,
    endings: {
      peace: { label: '失踪档案', sub: '永归宁国' },
      bliss: { label: '失踪档案', sub: '异神极乐' },
    },
    soon: '此页尚在书写。',
  },

  // DAY4 日志（方案 4，docs/specs/4.日志页面.pdf）
  // 黑底莫比乌斯环月亮，十字架尖端悬在中心圆月上方；点中心圆月 → 十字架扎下 → 像素交换转成白底纸页
  d4: {
    title: 'Observation Log',
    bloomAt: 50,                 // 同化值 ≥ 50：纸上长满银莲花
    gameOver: 'Game over.',
    toChurch: '前往教堂',
    // < 50：维西娅的调查报告（手写英文，停 1.5 秒变中文）。英文名 Vicia Karu（用户确认）
    report: {
      en: {
        date: 'Day 4 of the Great Hymn',
        head: ['Seravia Investigation Bureau', 'Case File 0110 · The Choir of Sacred Offering'],
        to: 'To the Chief Justiciar,',
        body: 'On the fourth day the Choir held its scheduled hymn rehearsal without incident. Visitor attendance has declined; two members of the tour no longer speak unless addressed. The candle stock in the east corridor exceeds the number of registered residents. The anemone fields are harvested daily, yet show no sign of thinning. I have not been invited into the inner ring. The investigation continues, and I remain of clear mind.',
        close: 'Respectfully submitted,',
        sign: 'Officer Vicia Karu',
        code: '0110',
      },
      zh: {
        date: '大颂礼 · 第四日',
        head: ['塞拉维亚调查局', '档案 0110 · 圣献唱诗院'],
        to: '致审判长：',
        body: '第四日，唱诗院按计划进行颂歌排练，未见异常。游客出勤人数下降，团中两人除被问话外已不再开口。东侧走廊的香烛存量多于登记在册的住院人数。银莲花田每日都有采摘，却丝毫不见稀疏。我尚未受邀进入内围。调查继续，本人神志清醒。',
        close: '谨呈',
        sign: '警员 维西娅·卡鲁',
        code: '0110',
      },
    },
    done: '本次述职结束',
    // 点了「本次述职结束」后纸上换成这一句（英文，停留 1.5 秒变中文）
    ping: { en: 'Your friend is trying to reach you…', zh: '您的朋友正在试图联系您…' },
    // 聊天：黑色在右边（莱恩），克莱因蓝在左边（维西娅）。点一条出下一条
    chat: [
      { who: 'ryan', text: '消息.zip' },
      { who: 'wei',  text: '庆祝你“升职”。' },
      { who: 'ryan', text: 'humm…那请你静候佳音？' },
      { who: 'wei',  text: '(=。=)' },
    ],
    back: '回望穹顶',
    // 述职分支最后，鼠标移到「前往教堂」时短暂浮出（还没看过 DAY 5 才出现），点它去地图
    mapHint: '地图似乎有异动',
  },

  // 教堂（方案 5，docs/specs/5.教堂界面.pdf）
  // ♢（DAY4 同化值 ≥ 50 时从 Game over 进来）：神像从右边渗进来 →「前往神国」→ 结局 1（谢幕页）
  // 非 ♢：红色天穹降临 → 字幕一句句 →「前往明天？」→ 回首页（首页变成「祂的食戮日」）
  church: {
    welcome: 'Welcome',
    join: '参加大颂礼',
    holyText: '你的意识踏入神国，祂的面容愈发清晰。',
    holyGo: '前往神国',
    auto: 4600,                  // 字幕不点也会自动下一句（毫秒）
    lines: [
      { zh: '主教砸碎了神像…', en: 'The bishop shattered the idol…' },
      { zh: '其他主教们失去了安宁，疯狂撕扯这被红光沐浴的白发主教……', en: 'The other bishops lost their peace, and tore at the white-haired bishop bathed in red light……' },
      { zh: '啊，新的主降临了。', en: 'Ah — a new Lord has come.', recolor: true },
      { zh: '所有人陷入了极乐！包括我！', en: 'Everyone has fallen into bliss! Even me!' },
      { zh: '「还会有失踪吗？」「也许吧。」', en: '“Will anyone else go missing?” “Perhaps.”' },
    ],
    last: { zh: '前往明天？', en: 'Onward to tomorrow?' },   // 只能点，不会自动跳
  },

  // 结局谢幕（结局 1：永归宁国）。全英文，像电影片尾一样往上滚；图片署名也放在这里
  ending: {
    lines: [
      ['title', 'THE CHOIR OF SACRED OFFERING'],
      ['sub', 'Ending I · Home, Forever, in the Kingdom of Peace'],
      ['gap'],
      ['role', 'Investigation Officer 0110', 'Vicia Karu / You'],
      ['role', 'The Believer', 'Ryan'],
      ['role', 'The Investigator', 'Anka'],
      ['role', 'The Visitors', 'A · B · C · D'],
      ['role', 'The Choir', 'Twenty-Four Voices'],
      ['role', 'The Twin Moons', 'Themselves'],
      ['gap'],
      ['role', 'Story, World & Design', 'liminous'],
      ['role', 'Code', 'Claude'],
      ['gap'],
      ['head', 'Recorded at'],
      ['line', 'The Choir of Sacred Offering'],
      ['line', 'A sub-world of the Creation Domain'],
      ['line', 'Eight days of the Great Hymn'],
      ['gap'],
      ['head', 'Images'],
      ['line', 'Revolver photograph — Gordon Gartrell, CC BY-SA 2.0, via Wikimedia Commons'],
      ['line', 'Chapel wall photograph — Jyuemim (Xiaohongshu)'],
      ['line', 'Black sun artwork — 無山 Wushan (Xiaohongshu)'],
      ['gap'],
      ['line', 'No visitor was harmed. Every visitor was kept.'],
      ['gap'],
      ['end', 'THE END'],
    ],
    // 明晰值 ≥ clarityAt 时多一行
    clarityAt: 35,
    thanks: 'Thank you for your due contribution to the ecology of the Mirror World.',
  },

  // 结局 2 之后的首页：唱片和银莲花变成黑日，左边变成「祂的食戮日」，待久了会融化
  bliss: {
    zh: '祂的食戮日',
    en: 'The Day of His Devouring',
    sunCredit: '图 · 小红书 @無山',
    meltAfter: 6000,             // 停留多久开始融化（毫秒）
  },

  // 4. 证物柜（方案 3）：白底，只有一只打开的手提箱。物件点一下拿出来，下方是文案和选项。
  // 选项只能选一次，同化值 / 明晰暗中计数，不给浏览者看。
  // 高低两档：同化值 ≥ highAt 用 hi，否则用 lo。
  evidence: {
    highAt: 20,
    putBack: '放回',
    items: {
      candle: { name: '白色香烛',
        text: '今日的你状态如何？',
        choices: [
          { id: 'light', label: '点燃', assim: 12 },
          { id: 'back',  label: '放回', assim: -5, clarity: 8 },
        ],
      },
      anemone: { name: '银莲花',
        text: '每个人来到此地都会获得一朵……花田还没薅秃吗？',
        assim: 1,                                // 第一次拿起来 +1
      },
      hymn: { name: '颂歌谱子',
        text: '灵魂升华之道。',
        textEn: 'The Way of the Soul’s Ascension.',
        choices: [
          { id: 'sing', label: '颂唱', assim: 12 },
          { id: 'fold', label: '折叠', assim: -5, clarity: 8 },
        ],
      },
      rules: { name: '游客守则' },
      missing: { name: '失踪档案' },
      gun:   { name: '银色左轮', hi: '做为主的眷属。',       lo: '神国之道，亦在其中。' },
      card:  { name: '调查局证件', hi: '我属于这里……吗？',     lo: '我将查明真相。' },
      pen:   { name: '蘸水笔', hi: '书写您的诗篇。',         lo: '创造我道的一切。' },   // 低：这支笔是她的伴生道具
      clue:  { name: '线索便签' },
      kraft: { name: '半张牛皮纸' },
      // 居室「游荡」捡到之后才出现在手提箱里；两半可以拼回去（同化值 +5，暗中）
      forever: { name: '另外半张牛皮纸', label: { en: 'TORN KRAFT PAPER', zh: '另外半张牛皮纸' }, ink: 'Forever' },
      merge: { label: '拼合', assim: 5 },
    },
  },

  // 颂歌谱子：英文细长花体；停留 1.5 秒闪成中文手写，字像蜡油一样融化扭曲；移开慢慢变回英文
  hymn: {
    title: 'Canticum Lunae',
    en: 'The Twin Moons are my shepherd; I shall not want. They make me to lie down in fields of anemone; they lead me beside the still waters. They restore my soul; they lead me in the paths of righteousness for their name’s sake. Yea, though I walk through the valley of the shadow of death, I will fear no evil: for thou art with me; thy candle and thy word, they lead me unto the Kingdom.',
    zh: '双月是我的牧者，我必不致缺乏。祂使我躺卧在银莲花田地上，领我在可安歇的水边。祂使我的灵魂苏醒，为自己的名引导我走义路。我虽然行过死荫的幽谷，也不怕遭害，因为你与我同在；你的烛火，你的引言，都引导我前往神国。',
  },

  // 5. 游客守则（方案 3）：写在笔记本左页，手写英文；停留 1.5 秒换成中文，移开恢复
  rules: {
    title: 'Visitor Rules',
    titleZh: '游客守则',
    items: [
      { en: 'Wear your choir robe at all times during your stay.', zh: '在院期间请全程穿着唱诗袍。' },
      { en: 'Do not leave the Choir.', zh: '请勿离开唱诗院。' },
      { en: 'Return to your room by nine each night, and light the candle.', zh: '请于每晚九点回到房间，并点燃香烛。' },
      { en: 'Do not pick the anemones.', zh: '请勿采摘银莲花。' },
      { en: 'Do not look upon the Twin Moons. Until you have entered the Kingdom, it is a desecration.', zh: '请勿直视双月，未前往神国时，此为亵渎之具。' },
      { en: 'Do not  ~~~~~~  the  ~~~~~~~~  after  ~~~~~', zh: '请勿 ～～～ 在 ～～～～ 之后 ～～～', blur: true },
    ],
  },

  // 6. 失踪档案（方案 3）：牛皮纸袋，点一下抽出一张旧纸
  missing: {
    head: '塞拉维亚人员失踪档案',
    meta: [
      ['档案编号', 'SL-0110-3141'],
      ['立案单位', '塞拉维亚调查局 · 失踪人口科'],
      ['立案日期', '', 'blur'],
    ],
    // 竖着排
    people: [
      { name: '艾莉·沃斯',   sex: '女', age: '24', job: '邮局分拣员',   when: '大颂礼第 2 日 · 晚祷后', where: '圣献唱诗院 · 居室' },
      { name: '奥伦·赫克',   sex: '男', age: '51', job: '钟表匠',       when: '大颂礼第 4 日 · 清晨',   where: '圣献唱诗院 · 钟楼' },
      { name: '玛蒂尔德',     sex: '女', age: '9',  job: '无',           when: '大颂礼第 5 日 · 不详',   where: '圣献唱诗院 · 银莲花田' },
      { name: '诺亚·贝尔',   sex: '男', age: '33', job: '中学音乐教师', when: '大颂礼第 7 日 · 圣乐聆演', where: '圣献唱诗院 · 圣堂' },
    ],
    labels: { name: '姓名', sex: '性别', age: '年龄', job: '职位', when: '失踪时间', where: '失踪地点' },
    hint: '点击纸袋，抽出一张',
    choices: [
      { id: 'read',   label: '浏览', assim: -5, clarity: 8 },
      { id: 'forget', label: '忘却', assim: 10 },
    ],
    forceAt: 20,          // 同化值 ≥ 20 时只能忘却
  },

  // 同化文字替换词典（[原词, 替换为]；原词可以写正则）
  replacements: [
    ['调查', '祷告'],
    ['失踪', '归主'],
    ['证据', '圣物'],
    ['离开', '留下'],
    ['痛', '安宁'],
    ['蓝', '白'],
    ['枪', '烛'],
    ['积分', '恩典'],
    ['记住', '忘记'],
    ['害怕', '平静'],
    ['名字', '——'],
    ['我(?!们)', '我们'],
  ],

};

// v0.2 additions. Base scenes above are deliberately kept separate.
window.CONTENT.v02 = {
  version: 'v0.2',
  images: { studio: 'assets/img/v02/studio.webp', paper: 'assets/img/v02/ref-c.webp', nuns: 'assets/img/v02/studio-exit.png', parlour: 'assets/img/v02/ref-b.webp', bishop: 'assets/img/v02/bishop.webp', sky: 'assets/img/v02/sky.webp' },
  delta: { hide: { assim: -10, clarity: 5 }, search: { assim: -8, clarity: 8 }, oldId: { assim: -5 }, archive: { assim: 10 }, eyes: { assim: -3, clarity: -5 }, continue: { assim: 2 }, out: { assim: 5 }, night: { assim: 15 }, reconnect: { assim: -20, claritySet: 70 } },
  oldNames: ['Mara Voss', 'Elias Arden', 'Irene Vale', 'Noel Maren', 'Silas Dorn'],
  leave: '离开', tryDoor: '尝试', tryText: '你与你的造物尝试了几种方法，都没能打开。',
  locked: '此刻无法进入。', gateLocked: '大门尚未开放。先完成档案室的调查。',
  archiveLocked: '似乎还有别的地方待探寻。',
  update: '调查记录已更新：地图上出现了新的可疑区域。',
  cluesReady: '两件证物已收录，可以前往钟楼档案室。', gateReady: '档案室调查已完成，大门已开放。',
  messageReady: '消息已送出。前往穹顶。',
  party: '注视。\n您的朋友和您的造物亦在其列。', welcomeBack: '欢迎再次回来',
  ourSky: '我们的天空', action: '行动', toDome: '回望穹顶',
  sent: '你将线索备份藏匿于文书箱中，借主教之便托人运走。',
  studio: {
    intro: '你的造物找到了从后门前往阁楼的捷径。\n厚重的书本、放着纯白蜡烛的铁箱子，以及宗卷与文书陈列其间。',
    options: [['hide', '隐匿'], ['search', '搜查'], ['down', '向下走去']],
    hide: '楼下人声隐隐约约。修女与神父们正在谈论最近唱诗院的异常。\n“游客……香烛……制作……”\n“……红色……蜡烛？……丢弃……”',
    after: '你沉思了一会。', wait: '你的造物拉住了你，提醒你这里似乎还有尚未搜查之处。',
    expel: '修女与神父神色慌张，强硬地将你们赶走。修女一路押送你们出去，并告诫你们不要擅闯。', locked: '巡查力度加深，不可再进入。'
  },
  parlour: { intro: '白发主教提前屏退其余人员，交给你一张塞拉维亚调查局 ID 卡。', take: '接过 ID 卡', inspect: '查看旧 ID', after: '你随手将卡交给身边的造物。她观察一番，将报告传输至你的终端。\n外观：磨损\n年份：约 3 年前' },
  archive: { intro: '你按照约定时间取回自己的笔。敲门后，白发主教将你们迎入。', presentLabel: '拿出证物', discussLabel: '商讨对策', solve: '破局？',
    present: '你打开手提箱，将蜡烛清单、磨损的 ID 卡、失踪档案与便签一一陈列。\n答案不言而喻。',
    discuss: '白发主教提出：前日那支笔的道具效力已经失效，无法绘制有效的神像稿。他怀疑这与你的状态有关。\n你如今头脑清醒，让他再次尝试。', done: '你们决定再次尝试。大门已开放。' },
  prayer: { zh: '主，我在这里。\n主，我信赖你。\n主，愿你的旨意成就。\n主，请接引我来到你的神国。\n一切为你，一切因你，一切归你。', en: 'Lord, I am here.\nLord, I trust in You.\nLord, may Your will be done.\nLord, lead me into Your kingdom.\nAll for You, all because of You, all unto You.' },
  anomaly: {
    chat: [{ who: 'ryan', text: '不&;$对……究竟是从哪一步，出/*_现了问题？', scramble: true }, { who: 'wei', text: '', liquid: true }, { who: 'ryan', text: '你在吗？' }, { who: 'wei', text: '……', liquid: true }],
    options: [['embrace', '拥抱穹顶'], ['church', '前往教堂'], ['reconnect', '尝试重连']],
    archive: '地面上散落着残破的纸片与碎屑，唯一一张黑色太阳手稿也变得暗淡扭曲。\n黑色在你的视线里变成了白色。你感到一阵宁静。',
    gaze: '银莲花田簇拥着卡塔西斯圣堂，你的心中感到一阵宁静。', gate: '祂永远的神国。', cathedral: '祂的眼眸如此深邃。', enterChurch: '进入教堂', tomorrow: '前往明日？', yes: '是', no: '否',
    diningIntro: '现在正是用餐时间', forward: '前进', girl: '你好，现在这里是你的家了吗？你好，你好，你好你好……', girlAlt: '女孩', head: '你干什么嘛！',
    field: '白色在你的视野里摇曳。它轻轻拉拽，你坠入其间。', pray: '月光定定地注视着你。', eyesLabel: '睁眼', continueLabel: '继续',
    eyes: '你的心中明明躁动不安，却又像被强制压下，逐渐趋于平静。', continue: '投落的视线挪移，你似乎忘却了什么事情。',
    walk: '其中出现了许多不像原本唱诗院的人，似乎是游客。他们低低念着“饶恕”“朝圣”与“献祭”。', out: '靠近交界之处，你听到一段又一段白噪音。你的内心感到一阵安宁。',
    leave: '你的造物拉住了你，似乎想提醒什么。\n你没有询问的意图。她拉不住你，只能看着你越走越远。',
    nightIntro: '入夜。', night: '你点燃白色香烛，开始夜祷。', nightLabel: '夜祷', evidence: '打开证物箱'
  },
  items: { candleList: '蜡烛清单', oldId: '磨损的调查局 ID', lang: '中文 / EN', flip: '翻面', close: '放回',
    listTitle: ['CANDLE REGISTER', '蜡烛清单'], headers: [['NAME', 'SEX', 'BURN LIMIT', 'DEVOTION'], ['姓名', '性别', '燃烧时限', '虔诚度']],
    rows: [['Mireille Voss', 'F', 17, '96%'], ['Ilya Seraphin', 'M', 11, '82%'], ['Elena Maren', 'F', 23, '74%'], ['Rafael Dorn', 'M', 7, '61%'], ['Nadia Lenk', 'F', 14, '88%']],
    worn: '外观：磨损 · 年份：约 3 年前', oldLabel: ['NAME', '姓名'] },
  cardZh: { bureau: '塞拉维亚调查局', ministry: '塞拉维亚司法部', subordinate: '隶属于塞拉维亚司法部', lineA: '本证所载签名及照片之持有人为正式任命的', title: '警员', lineB: '任职于塞拉维亚司法部所属调查局', fields: [['代号', '0110'], ['证件编号', '∞'], ['部门', '塞拉维亚情报部'], ['职务', '警员']], back: '兹委任持证人调查塞拉维亚境内违法行为，收集调查局涉及或可能涉及案件的证据，并履行法律赋予的其他职责。', signer: '首席司法官', order: '奉塞拉维亚首席司法官之命', issued: '签发 —— · 有效期至 ∞', signatureLabel: '签名' },
  infinityText: 'After the message was sent, you fulfilled the condition for leaving the Choir. The newly elevated cardinal welcomed a new One into the Choir of Sacred Offering. Yet the descent of a new god is not necessarily a blessing. May there be no more disappearances.',
  infinityTextZh: '消息送出后，你达成了离开唱诗院的条件。新晋的枢机主教迎接一位新的「祂」降临圣献唱诗院。然而，新神的降临未必是一种祝福。愿不再有人失踪。',
  infinitySub: ['Ending II · Ecstasy of the Other God [∞]', '结局二 · 异神极乐 [∞]'],
  creditsZh: { 'THE CHOIR OF SACRED OFFERING': '圣献唱诗院', 'Ending I · Home, Forever, in the Kingdom of Peace': '结局一 · 永归宁国', 'Investigation Officer 0110': '调查警员 0110', 'Vicia Karu / You': '维西娅·卡鲁 / 你', 'The Believer': '邪信徒', 'Ryan': '莱恩', 'The Investigator': '调查员', 'Anka': '安卡', 'The Visitors': '游客', 'The Choir': '唱诗班', 'Twenty-Four Voices': '二十四道声音', 'The Twin Moons': '双月', 'Themselves': '祂们', 'Story, World & Design': '故事、世界与设计', 'Code': '代码', 'Recorded at': '录制于', 'The Choir of Sacred Offering': '圣献唱诗院', 'A sub-world of the Creation Domain': '造物域下的副世界', 'Eight days of the Great Hymn': '大颂礼的八日', 'Images': '图像', 'Revolver photograph — Gordon Gartrell, CC BY-SA 2.0, via Wikimedia Commons': '左轮手枪摄影 — Gordon Gartrell，CC BY-SA 2.0，来自维基共享资源', 'Chapel wall photograph — Jyuemim (Xiaohongshu)': '祷告室围墙摄影 — Jyuemim（小红书）', 'Black sun artwork — 無山 Wushan (Xiaohongshu)': '黑日作品 — 無山 Wushan（小红书）', 'No visitor was harmed. Every visitor was kept.': '没有游客受到伤害。每位游客都被留了下来。', 'THE END': '终', 'Thank you for your due contribution to the ecology of the Mirror World.': '感谢您为镜界生态作出应有的贡献。' },
  review: { title: '本局回望', en: 'RUN REVIEW', copy: '复制本局记录', copied: '已复制', fallback: '请选中下方文字复制', home: '前往明天', names: { peace: '永归宁国', bliss: '异神极乐', infinity: '异神极乐 [∞]' },
    routes: { EARLY_MOON: '提前双月', REPORT_BLACK: '原述职路线', ANOMALY: '异常消息', RECONNECT: '尝试重连' }, yes: '已完成', no: '未完成',
    fields: { ending: '结局', assim: '同化', clarity: '明晰', report: 'D4 路线', route: '最终路线', choices: '关键选择', exploration: '探索进度', identity: '身份任务', sent: '消息送出', survived: '存活至第八日', yes: '是', no: '否' },
    actions: [['v02:hide', '隐匿'], ['v02:search', '取得蜡烛清单'], ['v02:oldId', '收录磨损 ID'], ['v02:nightPrayer', '夜祷'], ['v02:present', '拿出证物'], ['v02:discuss', '商讨对策']],
    decisions: { embrace: '拥抱穹顶', church: '前往教堂', reconnect: '尝试重连', eyes: '睁眼', continue: '继续' } }
};
