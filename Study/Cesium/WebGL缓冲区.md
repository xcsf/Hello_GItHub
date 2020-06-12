---
title: WebGL缓冲区
date: 2020-06-12 18:35:58
tags: WebGL
categories:
 - WebGL
 - 笔记
---

### 缓冲区对象

```javascript
gl.vertexAttrib4fv(a_Position,position)
gl.uniform4fv(u_FragColor,color)
```

我们使用上面的方法每次只能传入并绘制一个点，而对于多个顶点组成的对象需要一次性传入多个顶点到着色器中。
**缓冲区对象**可以一次性传入多个顶点数据。其实WebGL系统中的一块内存区域，可以一次性向缓冲区对象中填充大量数据，供着色器使用。

### 使用缓冲区对象

传入顶点数据

```javascript
//JS中的Array未对同类型大量元素数组做优化，所以使用类型化数组Float32Array
let vertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5])
let vertexBuffer = gl.createBuffer();
// Bind the buffer object to target
// target参数表示缓冲区对象的用途
// 参数gl.ARRAY_BUFFER表示缓冲区中包含了顶点数据。
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
// Write date into the buffer object
// 不能直接向缓冲区对象写入数据，只能向target上的缓冲区对象写入数据，所以必须先进行绑定。
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
// Assign the buffer object to a_Position variable
//gl.vertexAttribPointer(location, size, type, normalize, stride, offset)
//size指缓冲区中每个顶点的分量长度。如为2则默认每个顶点第三分量为0，第四分量为1。
gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
// Enable the assignment to a_Position variable
gl.enableVertexAttribArray(a_Position);
//关闭分配了缓冲区的attribute变量
// gl.disableVertexAttribArray(a_Position);
```

### 绘制

``` javascript
//gl.drawArrays(mode, first, count)
//mode指基本图形类型如POINTS、TRIANGLES、LINE_LOOP等
//first为0时，指从缓冲区中第1个坐标开始画起
//count代表画多少次，实际上着色器执行了count次
gl.drawArrays(gl.POINTS, 0, 3);
```





