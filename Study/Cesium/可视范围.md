
### 视点、观察目标点、上方向

**视点：** 观察者所处位置。

**观察目标点：** 被观察的点,确定视线。

**上方向：** 最终绘制在屏幕上的影像中的向上的方向。

### WebGL中观察者默认状态

 * 视点位于坐标系统(0,0,0)
 * 视线为Z负方向。观察点为(0,0,-1),上方向为Y轴负方向(0,1,0)

### 可视范围(正射类型)

WebGL只有物体在可视范围内才会绘制。水平视角、垂直视角、可视深度定义了**可视空间(view volume)**。

#### 可视空间

1. 长方体可视空间,盒装空间,正射投影(orthographic projection)产生。
2. 四棱锥/金字塔可视空间，由透视投影(perspective projection)产生。

##### 盒状空间

 由**近裁剪面**和**远裁剪面**两个矩形表面确定。
 **正射投影矩阵(orthographic projection matrix)**
 ``` javascript
Matrix4.prototype.setOrtho = function(left, right, bottom, top, near, far) {
  var e, rw, rh, rd;

  if (left === right || bottom === top || near === far) {
    throw 'null frustum';
  }
  rw = 1 / (right - left);
  rh = 1 / (top - bottom);
  rd = 1 / (far - near);

  e = this.elements;

  e[0]  = 2 * rw;
  e[1]  = 0;
  e[2]  = 0;
  e[3]  = 0;

  e[4]  = 0;
  e[5]  = 2 * rh;
  e[6]  = 0;
  e[7]  = 0;

  e[8]  = 0;
  e[9]  = 0;
  e[10] = -2 * rd;
  e[11] = 0;

  e[12] = -(right + left) * rw;
  e[13] = -(top + bottom) * rh;
  e[14] = -(far + near) * rd;
  e[15] = 1;

  return this;
};
 ```
 ![盒装空间](/img/盒装空间.png)

 ##### 可视空间

 ![透视投影可视空间](/img/透视投影可视空间.png)
 **透视投影矩阵(perspective projection matrix)**:
 1. 根据顶点与视点的距离，按比例进行了缩小变换
 2. 进行了平移变换，贴近视线。
 ``` javascript
 Matrix4.prototype.setPerspective = function(fovy, aspect, near, far) {
  var e, rd, s, ct;

  if (near === far || aspect === 0) {
    throw 'null frustum';
  }
  if (near <= 0) {
    throw 'near <= 0';
  }
  if (far <= 0) {
    throw 'far <= 0';
  }

  fovy = Math.PI * fovy / 180 / 2;
  s = Math.sin(fovy);
  if (s === 0) {
    throw 'null frustum';
  }

  rd = 1 / (far - near);
  ct = Math.cos(fovy) / s;

  e = this.elements;

  e[0]  = ct / aspect;
  e[1]  = 0;
  e[2]  = 0;
  e[3]  = 0;

  e[4]  = 0;
  e[5]  = ct;
  e[6]  = 0;
  e[7]  = 0;

  e[8]  = 0;
  e[9]  = 0;
  e[10] = -(far + near) * rd;
  e[11] = -1;

  e[12] = 0;
  e[13] = 0;
  e[14] = -2 * near * far * rd;
  e[15] = 0;

  return this;
};
 ```

 ### 模型视图投影矩阵(model view projection matrix)

*顶点在规范立方体中的坐标 = <投影矩阵>x<视图矩阵>x<模型矩阵>x<顶点坐标>*
*<投影矩阵>x<视图矩阵>x<模型矩阵>* 这个式子和顶点没关系，可以再js中计算出结果，即**模型视图投影矩阵**传入给顶点着色器。