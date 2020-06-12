---
title: WebGL 图元装配到光栅化与varying变量
date: 2020-06-12 18:35:58
tags: WebGL
categories:
 - WebGL
 - 笔记
---
## WebGL 图元装配到光栅化与varying变量

**图元装配过程(primitive assembly process)**

**几何图形装配(geometric shape assembly)**

1.声明attribute vec4 a_Color 接受数据

2.赋值给varying vec4 v_Color

3.片元着色器中声明varying vec4 v_Color

> 如果顶点着色器中有**类型和命名相同的varying变量**，那么顶点着色器赋给该变量的值就会被自动传入片元着色器。


```javascript
let VSHADER_SOURCE = 
"attribute vec4 a_Position;\n" +
"attribute float a_PointSize;\n" +
"attribute vec4 a_Color;\n" +
"varying vec4 v_Color;\n" + 
// varying variable
"uniform mat4 u_ModelMatrix;\n" +
"void main() {\n" +
"  gl_Position = u_ModelMatrix * a_Position;\n" +
"  gl_PointSize = a_PointSize;\n" +
"  v_Color = a_Color;\n" +
 // Pass the data to the fragment shader
"}\n"
let FSHADER_SOURCE = 
"precision mediump float;\n" +
"uniform vec4 u_FragColor;\n" +
"varying vec4 v_Color;\n" + 
// Receive the data from the vertex shader
"void main() {\n" +
"  gl_FragColor = v_Color;\n" +
"}\n",
```

### varying变量的作用和内插过程
varying变量。只能是float、vec2、vec3、vec4、mat2、mat3、mat4。必须全局。最少支持8个。
顶点着色器中的```v_Color```在传入片元着色器之前经过了内插过程。WebGL根据我们传入的颜色值，自动计算出所有片元的颜色，赋值给片元着色器中的```v_Color```。

### 图元装配到光栅化

![绘制过程](/img/shader.png)


1. 缓冲区对象中第一个坐标传递给```a_Position```继而被赋值给```gl_Position```，赋值后改顶点进入图形装配区，并储存。
2. 重复执行顶点着色器，将所有坐标点传入并存储在装配区。
3. 装配图形。根据```gl.drawArrays()```第一个参数决定如何装配顶点。
4. 光栅化。将装配好的图元转化为片元(像素)。
5. 光栅化结束后，逐片元调用片元着色器。每次处理一个片元，计算出该片元颜色，写入颜色缓冲区。直到所有片元被处理完，浏览器显示出结果。