---
title: WebGL着色器与变量
date: 2020-06-12 18:35:58
tags: WebGL
categories:
 - WebGL
 - 笔记
---

### 着色器(shader)

### 1.顶点着色器(Vertex shader)

> 用于描述顶点特性（如颜色、位置等）。顶点指的是二维或者三维空间中的的一个点。

> **内置变量:**
>
> vec4 gl_Position 表示顶点位置
>
> float gl_PointSize 表示点的尺寸(像素数)

### 2.片元着色器(Fragment shader)

> 进行逐片元的处理过程如光照。片元，可以将其理解为像素。

> **内置变量:**
>
> vec4 gl_FragColor 指定片元颜色(RGBA格式)

![绘制过程](/img/shader.png)

### 3.使用着色器的WebGL程序

将位置信息从JavaScript程序中传给顶点着色器。可以通过**attribute变量**和**uniform变量**。

**attribute变量：** 传输与顶点相关数据。给顶点着色器使用。只能是vec2,vec3,vec4,float,mat2,mat3,mat4类型。最少支持8个。必须全局。

**uniform变量：** 对于顶点相同的数据（与顶点无关）。给片元着色器使用。顶点着色器中最少支持128个，片元着色器中最少支持16个。必须全局。

**声明（例）：**

```js
attribute vec4 a_Position;
uniform vec4 u_FragColor;
```

**获取attribute，uniform变量：**

```javascript
let a_Position = gl.getAttribLocation(gl.program,"a_Position");
//返回attribute变量位置,否则-1(具有webgl_或者gl_前缀或变量不存在)
let u_FragColor = gl.getUniformLocation(gl.program,"u_FragColor");
//返回uniform变量位置,否则null
```

**attribute，uniform变量赋值:**

其中第2,3分量默认为0.0，第四分量默认1.0。

[WebGLRenderingContext.vertexAttrib[1234]f[v]()](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/vertexAttrib)

[WebGLRenderingContext.uniform[1234][fi][v]()](https://developer.mozilla.org/zh-CN/docs/Web/API/WebGLRenderingContext/uniform)

```javascript
gl.vertexAttrib1f(a_Position,v1);
gl.vertexAttrib2f(a_Position,v1,v2);
gl.vertexAttrib3f(a_Position,v1,v2,v3);
gl.vertexAttrib4f(a_Position,v1,v2,v3,v4);
//或者用以v结尾函数版本
let position = new Float32Atrray([1.0, 2.0, 3.0, 1.0]);
gl.vertexAttrib4fv(a_Position,position)

gl.uniform1f(u_FragColor,v1);
gl.uniform2f(u_FragColor,v1,v2);
gl.uniform3f(u_FragColor,v1,v2,v3);
gl.uniform4f(u_FragColor,v1,v2,v3,v4);
//或者用以v结尾函数版本
let color = new Float32Atrray([1.0, 2.0, 3.0, 1.0]);
gl.uniform4fv(u_FragColor,color)
```

**WebGL函数命名规范:**<基础函数名><参数个数><参数类型>

**着色器初始化:**

着色器程序由**OpenGL ES着色器语言(GLSL ES)** 编写。在JavaScript以字符串形式编写，传给WebGL系统。

```javascript
let VSHADER_SOURCE =
    "attribute vec4 a_Position;\n" +
    "void main() {\n" +
    "  gl_Position = a_Position;\n" +
    "  gl_PointSize = 10.0;\n" +
    "}\n",
let FSHADER_SOURCE =
    "precision mediump float;\n" +
    "uniform vec4 u_FragColor;\n" +
    "void main() {\n" +
    "  gl_FragColor = u_FragColor;\n" +
    "}\n",

// Create shader object
let vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, VSHADER_SOURCE);
gl.compileShader(vertexShader);
let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, FSHADER_SOURCE);
gl.compileShader(fragmentShader);

// Create a program object
let program = gl.createProgram();

// Attach the shader objects
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

// Link the program object
gl.linkProgram(program);
gl.useProgram(program);
```

