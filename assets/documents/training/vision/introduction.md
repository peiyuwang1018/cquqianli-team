# 视觉算法入门培训文档

# Part 0:

## Class 0:  序章

### RoboMaster是什么？

RoboMaster 机甲大师高校系列赛（RMU, RoboMaster University Series），作为全国大学生机器人大赛旗下赛事之一，是专为全球科技爱好者打造的机器人竞技与学术交流平台。自2013年创办至今，始终秉承**“为青春赋予荣耀，让思考拥有力量，服务全球青年工程师成为追求极致、有实干精神的梦想家”**的理念，致力于培养与吸纳具有工程思维的综合素质人才，并将科技之美、科技创新理念向公众广泛传递。

平台要求参赛队员走出课堂，组成机甲战队，自主研发制作多种机器人参与团队竞技。他们将通过大赛获得宝贵的实践技能和战略思维，在激烈的竞争中打造先进的智能机器人。高校系列赛的规模逐年扩大，至今已举办10年，每年吸引全球400余所高等院校参赛、累计培养近10万名青年工程师走向社会，并与数百所高校开展各类人才培养、实验室共建等产学研合作项目。

[https://www.robomaster.com/zh-CN/robo/overview?djifrom=homepage]()

### 赛事文化：

![image\.png](图片和附件/image.png)

![image\.png](图片和附件/image%201.png)

![image\.png](图片和附件/image%203.png)

### 精彩赛事：

#### 25赛季\-超级对抗赛\-区域赛八进四淘汰赛（上海交通大学对战哈尔滨工业大学）

[https://www.bilibili.com/video/BV1nejhzEEx7/?spm_id_from=333.337.search-card.all.click&vd_source=4857770211727eec6925816279b00871]()

#### 25赛季\-超级对抗赛\-全国赛冠军争夺战（上海交通大学对战中国科学技术大学）

[https://www.bilibili.com/video/BV1h8t3zzEWN?spm_id_from=333.788.videopod.sections&vd_source=4857770211727eec6925816279b00871]()

### RM视觉算法组：

在赛场上，我们充当的就是机器人的"眼睛"和"大脑"，让我们的机器人在赛场上能够感知环境，并作出积极决策和响应。具体而言我们的任务包含但不限于：装甲板自瞄，能量机关自瞄，雷达站全局视野，工程自动取矿/兑矿，飞镖制导/反导等等。

下面这篇文章对视觉组的描述非常详细，大家可以阅读并探索其中你认为有趣的方向。

[https://blog.csdn.net/weixin_42754478/article/details/108159529]()



**对于重庆大学RM千里战队视觉算法组，在26赛季，我们目前规划有以下的组织架构：**

[26赛季视觉组组内成员架构](https://cquqianli.feishu.cn/wiki/Zhb6wHHz5iCCnqkzJ0xcxlGnnSe)

![image\.png](图片和附件/image%202.png)

本赛季我们计划**长期开放招新通道**，不强制设置学习开始时间和学习截至时间（联盟赛和对抗赛备赛备赛期除外，约为次年3月开始，此时招新频率可能会降低）。在招新群内，我们会定期发布问卷用于统计学习情况和学习反馈，如果你有意向加入RM视觉算法组，可以填写问卷反馈学习进度。当你**完成入门文档的最终任务**后，我们会联系你参与面试，通过后即可正式成为视觉组梯队队员。

如果有任何学习上的问题（无论你是否想加入RM视觉算法组），都可以与我们进行交流，我们很乐意给出解答。



### How\-To\-Ask\-Questions\-The\-Smart\-Way

首先，在开始学习前，我们希望你能认真阅读完下面这篇文档：

[https://github.com/ryanhanwu/How-To-Ask-Questions-The-Smart-Way/blob/main/README-zh_CN.md]()

[https://gitee.com/SheepYhangCN/How-To-Ask-Questions-The-Smart-Way]()

\(第一个链接为原仓库，需要科学上网，可以查看第二个链接中的内容\)

他能很大程度上教你学会如何探索新知识，如何提问以及如何读懂别人的回答。

这是一切自学的基础，它会让你受益良多，并且能够促使大家共同打造一个更美好的知识共享环境。



### 本教程大纲：

**完成本文档的学习，你将会收获：**

1. C\+\+/Python基础1（基础语法，条件、循环、函数，面向对象编程思想）

2. Linux基础（了解Linux，安装虚拟机，安装Ubuntu2204，配置cpp/py基本环境）

3. C\+\+/Python基础2（学习使用cmake）

4. Git基础（安装Git，创建仓库，管理修改并提交，远程仓库管理）

5. C\+\+/Python进阶：Opencv的使用。（配置Opencv\-python和Opencv\-cpp环境，基础文件操作，基本图像处理，基本硬件交互，相机标定，pnp算法等）

6. Ros2基础（了解"节点"，"功能包"，"工作区间"，学习四种通信方式，搭建一个多节点demo）

7. 神经网络入门（了解YOLO是什么、有什么用，制作目标检测数据集，训练第一个目标检测模型，使用py进行模型推理，转换模型格式，使用cpp进行模型推理）

**学习视觉最难的往往是迈出第一步的决心，一步一个脚印，很快你就能探索到新的天地！**



# 培训文档食用方法：

1. **对于每节Class，我们会在文档开头会给出一个或多个任务（部分通识性课程除外），你的目标就是参考文档内容或通过其他方式进行学习，然后最终完成该任务。**

2. 对于每篇文档，如果你能**完成该节的任务目标并完整理解你所写的代码（或整体逻辑）**，那么你已经可以算**初步完成了该节课程的学习要求**，你可以**开始下一节课程的学习**或是继续**深入学习本节内容**。

3. 在完成**每节课程**的任务后，记得做好记录。并在**每个章节**完成后进行总结和反思（学到了什么？遇到了哪些问题？如何解决？）

4. **无论你之前是否有学习过某节课程的内容，我们都建议你将每节课程的任务目标完成并做好记录，这是对你能力的检验和回顾。**

5. 如果你认为教学文档存在问题（知识性错误、逻辑不通顺、知识跨度过大等等），欢迎给我们反馈（你可以直接私信任意视觉组成员或是直接在群聊中指出或是填写下列问卷），我们会及时进行矫正和勘误，十分感谢。

反馈问卷：https://cquqianli\.feishu\.cn/share/base/form/shrcnnrmOcIcHldsIyKNfsYgKvm

# Part 1: C\+\+与Python基础

## Class 1: C\+\+/Py基础语法

[Class 1: C\+\+/Py基础语法](https://cquqianli.feishu.cn/docx/NwOmdu4GponBAdxuJkhcjt8ennb?from=from_copylink)

## Class 2: 条件、循环、函数

[Class 2: 条件、循环、函数](https://cquqianli.feishu.cn/docx/EngRdC9KEoo9q2xyMUicjee9nDc?from=from_copylink)

## Class 3: 面向对象编程思想

[Class 3: 面向对象编程思想](https://cquqianli.feishu.cn/docx/ASd7dYWnYoWP9UxIpjmchzaLnzc?from=from_copylink)



# Part 2: Linux基础

## Class 4: Linux是什么？

[Class 4: Linux是什么？](https://cquqianli.feishu.cn/docx/UMJudA1F8oUiT8xDVfUcQ1e4n3e?from=from_copylink)

## Class 5: 安装Vmware和Ubuntu22\.04

[Class 5: 安装Vmware和Ubuntu22\.04](https://cquqianli.feishu.cn/docx/Vq4udJGzCoC8dMxTxU4cCowNnhe?from=from_copylink)

## Class 6: 在Ubuntu中配置cpp编译链和python环境

[Class 6: 在Ubuntu中配置cpp编译链和python环境](https://cquqianli.feishu.cn/docx/YW2JdLrBUoEgcExxEADcRWHin4f?from=from_copylink)

## Class 7: 使用cmake进行编译

[Class 7: 使用cmake进行编译及C\+\+代码能力提升](https://cquqianli.feishu.cn/docx/EsosdAhXIoN3aHxcF2DciSvgnih?from=from_copylink)



# Part 3: Git基础

**本章课程及后续课程**请在上一章节安装的**虚拟机**中进行学习。

> Class 8 \~ Class 11可以直接阅读廖雪峰git教程：
> 
> [https://liaoxuefeng.com/books/git/introduction/index.html]()
> 
> 

## Class 8: 在Ubuntu上安装Git

> 依序观看廖雪峰Git教程中的下列内容，不需要完成额外任务
> 
> 

1. Git是什么

2. 安装Git

## Class 9: 创建Git仓库

> 依序观看廖雪峰Git教程中的下列内容，不需要完成额外任务
> 
> 

1. 创建版本库

## Class 10: 管理修改并提交

> 依序观看廖雪峰Git教程中的下列内容，不需要完成额外任务
> 
> 

1. 时光机穿梭

## Class 11: 远程仓库管理

> 依序观看廖雪峰Git教程中的下列1 \~ 5节内容
> 
> 

1. 远程仓库

2. 分支管理

3. 标签管理

4. 使用Github（需要科学上网，如果存在网络问题可跳过）

5. 使用Gitee

## Class 12: 在Vscode中使用Git

[Class 11: 远程仓库管理\-\-在Vscode中使用git](https://cquqianli.feishu.cn/docx/XxzjdAdcAozr0zxlL2tcudDvnEb?from=from_copylink)



# Part 4: Opencv基础

## Class 13: Opencv\-python和Opencv\-cpp环境配置

[Class 13: Opencv\-python和Opencv\-cpp环境配置](https://cquqianli.feishu.cn/docx/CHCGdjKxQo2asIx4XYqcs0CSnpd?from=from_copylink)

## Class 14: opencv 基础文件操作

[Class 14: opencv 基础文件操作](https://cquqianli.feishu.cn/docx/WTAbdFtwvoXNAixLSKCcfbT2npe?from=from_copylink)

## Class 15: opencv 基础图像处理

[Class 15: opencv 基础图像处理](https://cquqianli.feishu.cn/docx/CvGwdnUwpoASVxx3ICIcF4ZAnre?from=from_copylink)

## Class 16: opencv 基础硬件交互

[Class 16: opencv 基本硬件交互（USB摄像头）](https://cquqianli.feishu.cn/docx/EriqdYoj9oidJSxhKy7c6FDunSH?from=from_copylink)

## Class 17: 相机标定

[Class 17: 相机标定](https://cquqianli.feishu.cn/docx/XYzJdYMSTo3N6kxex8UcVCJsneb?from=from_copylink)

## Class 18: Pnp算法

[Class 18: Pnp算法](https://cquqianli.feishu.cn/docx/KYQNdVtbVoxA8vxnpILcHCdcntb?from=from_copylink)



# Part 5: Ros2基础

## Class 19: Ros2基础

[Class 19: Ros2基础](https://cquqianli.feishu.cn/docx/Vf7EdPuOyoB3tUxVq19cizCbnsh?from=from_copylink)



# Part 6: 神经网络基础

## Class 20: 什么是YOLO？YOLO能做什么？

[Class 20: 什么是YOLO？YOLO能做什么？](https://cquqianli.feishu.cn/docx/Fylpd6El1oIROcxEm2vcnVXLnLc)

## Class 21: 部署标注工具，体验模型推理

[Windows Linux yolo训练及推理环境配置](https://cquqianli.feishu.cn/wiki/TAVSwEYfci5SySkX5jycgtuxnLh?from=from_copylink)

## Class 22: 制作yolo检测任务数据集并训练

[Class 22: 制作yolo检测任务数据集并训练](https://cquqianli.feishu.cn/docx/Dujedefdjot6syxpptpcXtJon7f)

## Final: 

最终任务：完成以下文档中的任务要求。

[26赛季视觉基础培训说明](https://cquqianli.feishu.cn/wiki/SaSMwEiHBiqcwbkW9uBcxvkBnPh)



# 扩展：

## 扩展1：Windows配置C\+\+编译环境

[扩展1：Windows配置C\+\+编译环境](https://cquqianli.feishu.cn/docx/H3OYdlB0foTsovxO9V5clDStnff?from=from_copylink)



