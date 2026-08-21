(() => {
const lessons = {
  mechanical: {
    name: "机械结构组",
    english: "MECHANICAL STRUCTURE",
    detailHref: "groups/mechanical.html",
    icon: "assets/images/brand/vector-icons/mechanical.svg",
    recruitment:
      "从整机任务和真实约束出发，把结构、机构、加工装配与测试迭代连成一条完整工程链路。这里不仅需要画出零件，更需要让机器人可靠地制造出来、装起来并在赛场上持续工作。",
    directions: ["自顶向下 CAD", "整机布局", "轻量化与仿真", "加工装配", "测试迭代"],
    lesson: {
      eyebrow: "MECHANICAL · LESSON 01",
      title: "从一台竞技机器人开始认识机械工程",
      author: "汪沛宇",
      summary:
        "从 RoboMaster 赛场与机器人整机出发，认识机械结构组如何把设计、制造、装配、维护和测试连接成完整的工程闭环。",
      outcome:
        "完成课程后，你将对机械组的工作边界、常用工具和赛季研发流程形成整体认识，并知道后续应从哪里开始补齐能力。",
      topics: ["RoboMaster 与机器人系统", "机械组工作边界", "整机布局与机构设计", "加工装配与维护", "工程测试与迭代"],
      stages: ["先建立整机认识", "再理解设计与制造", "最后进入真实项目"],
      tools: ["Fusion 360 / CAD", "工程图", "加工装配", "测试记录"],
      pageHref: "museum/training/mechanical.html",
      downloadHref: "assets/documents/training/mechanical/qianli-mechanical-lesson-01-watermarked.pdf",
    },
  },
  control: {
    name: "电气控制组",
    english: "ELECTRICAL CONTROL",
    detailHref: "groups/control.html",
    icon: "assets/images/brand/vector-icons/control.svg",
    recruitment:
      "围绕机器人的控制软件与整车数据流工作：让遥控输入、传感器反馈、运动解算、通信链路和执行器在同一套可靠的软件架构中协同起来。",
    directions: ["嵌入式开发", "运动控制", "通信链路", "整车状态机", "赛季联调"],
    lesson: {
      eyebrow: "CONTROL · LESSON 01",
      title: "如何控制属于你的一台 RoboMaster 机器人",
      summary:
        "不从芯片手册逐页背起，而是先沿着一台机器人完整的数据流，认识嵌入式控制究竟在解决什么问题。",
      outcome:
        "完成课程后，你将能读懂从遥控输入到电机输出的基本链路，并建立一套 STM32 底盘或云台项目的整体认知。",
      topics: ["STM32F407 与开发环境", "电机通信与反馈", "基础闭环控制", "底盘 / 云台运动解算", "多板通信与项目集成"],
      stages: ["先看懂完整系统", "再搭建关键模块", "最后进入整车工程框架"],
      tools: ["C / C++", "STM32CubeMX", "HAL", "CLion / CMake", "Git"],
      author: "杨杨文琦",
      pageHref: "museum/training/control.html",
      sourceHref: "assets/documents/training/control/introduction.md",
      fallbackHtml: `
        <h2>如何控制属于你的一台 RoboMaster 机器人</h2>
        <p>这门第一课不要求你先背完芯片手册，而是先沿着一台机器人完整的数据流，理解嵌入式控制究竟在解决什么问题：输入从哪里来，控制目标如何被计算，执行器如何收到命令，反馈又如何回到系统。</p>
        <h3>为什么先看系统</h3>
        <p>对初学者来说，最困难的往往不是某一行代码，也不是某个软件按钮，而是没有人告诉你 GPIO、CAN、USART、HAL、CubeMX、FreeRTOS 这些词在同一套工程里分别处于什么位置。</p>
        <blockquote>这套教程希望你用自顶向下的设计思维理解整车控制，再从最小模块开始亲手实现。</blockquote>
        <h3>学习路线</h3>
        <ol><li>建立开发、编译、烧录与调试环境。</li><li>通过总线驱动电机，并接收电机反馈。</li><li>建立基础闭环控制和控制器模块。</li><li>接收遥控器数据，完成底盘与云台运动解算。</li><li>组织任务周期、多板通信，并整合为完整工程。</li></ol>
        <h3>学习约定</h3>
        <ul><li>主要入门平台采用 STM32F407。</li><li>主要工程语言采用 C/C++。</li><li>使用 STM32CubeMX、HAL、CLion/CMake 和 Git。</li><li>先掌握模块输入、输出和依赖关系，再进入更底层的手册细节。</li></ul>
        <p class="training-document-fallback">若当前浏览器允许读取本地文档，本页会继续加载完整 Markdown 原文；否则先显示这份站内整理版。</p>`,
    },
  },
  vision: {
    name: "视觉算法组",
    english: "VISION ALGORITHM",
    detailHref: "groups/vision.html",
    icon: "assets/images/brand/vector-icons/vision.svg",
    recruitment:
      "让机器人获得赛场上的眼睛与大脑：从图像、传感器和场地信息中识别目标、估计位置、预测运动，并把算法稳定部署到真实机器人上。",
    directions: ["计算机视觉", "目标识别", "定位解算", "运动预测", "算法部署"],
    lesson: {
      eyebrow: "VISION · LESSON 01",
      title: "视觉算法序章：成为机器人的眼睛与大脑",
      summary:
        "先认识 RoboMaster 赛场中视觉算法真正承担的任务，再沿着 C++、OpenCV、ROS2 与深度学习建立后续学习路线。",
      outcome:
        "你将知道装甲板自瞄、能量机关、雷达全局感知、工程自动作业与飞镖引导分别需要怎样的视觉能力。",
      topics: ["C++ / Python 基础", "Linux 与开发环境", "OpenCV 与相机标定", "PNP 位姿解算", "ROS2", "YOLO 与推理部署"],
      stages: ["理解赛场任务", "补齐工具链", "完成视觉小项目"],
      tools: ["C++", "Python", "OpenCV", "ROS2", "YOLO", "Git"],
      author: "李嘉昊、张珂玮、杨彬意",
      pageHref: "museum/training/vision.html",
      sourceHref: "assets/documents/training/vision/introduction.md",
      fallbackHtml: `
        <h2>视觉算法序章：成为机器人的眼睛与大脑</h2>
        <p>视觉算法组负责让机器人感知赛场、定位目标并把结果稳定交给整车系统。任务包括装甲板自瞄、能量机关、雷达全局视野、工程自动作业、飞镖制导与反导等。</p>
        <h3>先认识 RoboMaster</h3>
        <p>RoboMaster 要求参赛队员走出课堂，自主研发机器人参与团队竞技。视觉组在其中连接图像、算法、传感器和整车决策，是机器人能否主动观察并响应赛场的重要环节。</p>
        <div class="group-letter-gallery"><img src="assets/documents/training/vision/images/01.png" alt="RoboMaster 赛事文化预览" loading="lazy" /><img src="assets/documents/training/vision/images/02.png" alt="RoboMaster 赛事现场预览" loading="lazy" /><img src="assets/documents/training/vision/images/03.png" alt="视觉任务预览" loading="lazy" /></div>
        <h3>本教程大纲</h3>
        <ol><li>C++ / Python 基础：语法、函数、面向对象。</li><li>Linux 基础：Ubuntu、开发环境和编译链。</li><li>Git 基础：版本管理、提交和远程仓库。</li><li>OpenCV：图像处理、相机标定、PNP 位姿解算。</li><li>ROS2：节点、功能包、工作区和通信方式。</li><li>神经网络：YOLO、数据集制作、训练、推理与部署。</li></ol>
        <h3>学习方法</h3>
        <p>每节课会给出任务目标。你需要参考文档或自行学习完成任务，并做好记录和复盘。能完成任务、理解自己写下的代码和整体逻辑，才算真正进入下一节。</p>
        <p class="training-document-fallback">若当前浏览器允许读取本地文档，本页会继续加载完整 Markdown 原文；否则先显示这份站内整理版。</p>`,
      images: [
        "assets/documents/training/vision/images/01.png",
        "assets/documents/training/vision/images/02.png",
        "assets/documents/training/vision/images/03.png",
        "assets/documents/training/vision/images/04.png",
      ],
    },
  },
  hardware: {
    name: "硬件开发组",
    english: "HARDWARE DEVELOPMENT",
    detailHref: "groups/hardware.html",
    icon: "assets/images/brand/vector-icons/hardware.svg",
    recruitment:
      "负责机器人电路、电气连接、供电保护、传感器接入与硬件可靠性支持，让每一块板卡和每一束线缆都能经受真实赛场的振动、冲击与维护压力。",
    directions: ["电路设计", "电气系统", "供电保护", "传感器接入", "可靠性验证"],
    lesson: null,
  },
  operations: {
    name: "宣传运营组",
    english: "OPERATIONS",
    detailHref: "groups/operations.html",
    icon: "assets/images/brand/vector-icons/operations.svg",
    recruitment:
      "把赛事、工程与团队故事准确地传递出去，同时支撑活动、品牌、资料、财务和对外沟通，让一支工程队伍能够被看见、被理解并持续运转。",
    directions: ["品牌视觉", "内容传播", "活动组织", "资料与财务", "对外沟通"],
    lesson: null,
  },
};

const node = document.createElement("script");
node.type = "application/json";
node.id = "qianli-training-data";
node.textContent = JSON.stringify(lessons);
document.head.append(node);
})();
