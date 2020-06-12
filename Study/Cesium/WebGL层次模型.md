---
title: 层次模型
date: 2020-06-12 18:35:58
tags: WebGL
categories:
 - WebGL
 - 笔记
---

### 处理复杂的三维模型

多个简单模型组成的复杂模型，其之间存在连接关系，例如“A部件带动B部件运动”。

三维模型之间并没有真正连接在一起。**上层的变化时需要施加其下层模型同样的模型矩阵**，这样，上层模型就能跟随下层模型变换。

### 通过索引绘制物体

将三角形顶点索引写入缓冲区，并绑定到```gl.ELEMENT_ARRAY_BUFFER```

使用```gl.drawElements()```进行绘制。其对每个索引值，从绑定到```gl.ARRAY_BUFFER```的缓冲区中获取顶点信息，并传递给attribute变量，执行一次顶点着色器。

1. 可以重复利用顶点信息，控制内存开销。

2. 索引值无法将颜色区分开，颜色依赖于顶点，所以如果单个点在不同表面上时，需要创建多个具有相同坐标不同颜色的顶点。

### 着色器与着色器程序对象

**着色器对象：**管理一个顶点着色器或者一个片元着色器。每个着色器都是一个着色器对象。

**程序对象：**管理着色器对象的容器。一个程序对象必须包含一个顶点着色器与一个片元着色器。

#### 创建和初始化着色器

```javascript
gl.createShader(type) //1.创建着色器对象
gl.shaderSource(shader, source) //2.向着色器对象中填充着色器程序源代码
gl.compileShader(shader) //3.编译着色器
---------
gl.createProgram() //4.创建程序对象
gl.attachShader(program, shader) //5.为程序对象分配着色器
gl.linkProgram(program) //6.连接程序对象
gl.useProgram(program) //7.使用程序对象
```

