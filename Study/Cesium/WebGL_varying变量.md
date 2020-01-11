## WebGL varying变量

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
顶点着色器中的```v_Color```在传入片元着色器之前经过了内插过程。WebGL根据我们传入的颜色值，自动计算出所有片元的颜色，赋值给片元着色器中的```v_Color```

