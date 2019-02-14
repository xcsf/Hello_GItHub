### Javascript读取Shapefile教程



#### 一、Shapefile 简介

​        Shapefile是美国环境系统研究所公司（ESRI）开发的一种空间数据开放格式，属于一种矢量图形格式，它能够保存几何图形的位置及相关属性，实际上该种文件格式是由多个文件组成的，有三个必须的文件:
​        .shp— 图形格式，用于保存元素的几何实体。
​        .shx— 图形索引格式。几何体位置索引，记录每一个几何体在shp文件之中的位置，能够加快向前或向后搜索一个几何体的效率。
​        .dbf— 属性数据格式，以dBase IV的数据表格式存储每个几何形状的属性数据。

#### 二、shp 文件

​        shp文件存储了坐标位置信息，该文件由一个定长的文件头和一个或若干个变长的记录数据组成。每一条变长数据记录包含一个记录头和一些记录内容。主文件头包含17个字段，共100个字节，其中包含九个4字节（32位有符号整数，int32）整数字段，紧接着是八个8字节（双精度浮点数）有符号浮点数字段。

| 字节  | 类型   | 字节序 | 用途                                                         |
| ----- | ------ | ------ | ------------------------------------------------------------ |
| 0–3   | int32  | 大端序 | 文件编号 (永远是十六进制数0x0000270a)                        |
| 4–23  | int32  | 大端序 | 五个没有被使用的32位整数                                     |
| 24–27 | int32  | 大端序 | 文件长度，包括文件头。（用16位整数表示）                     |
| 28–31 | int32  | 小端序 | 版本                                                         |
| 32–35 | int32  | 小端序 | 图形类型（参见下面）                                         |
| 36–67 | double | 小端序 | 最小外接矩形(MBR)，也就是一个包含shapefile之中所有图形的矩形。以四个浮点数表示，分别是X坐标最小值，Y坐标最小值,X坐标最大值，Y坐标最大值。 |
| 68–83 | double | 小端序 | Z坐标值的范围。以两个浮点数表示，分别是Z坐标的最小值与Z坐标的最大值。 |
| 84–99 | double | 小端序 | M坐标值的范围。以两个浮点数表示，分别是M坐标的最小值与M坐标的最大值。 |

​        然后这个文件包含不定数目的变长数据记录，每个数据记录以一个8字节记录头开始：

| 字节 | 类型  | 字节序 | 用途                       |
| ---- | ----- | ------ | -------------------------- |
| 0–3  | int32 | 大端序 | 记录编号 (从1开始)         |
| 4–7  | int32 | 大端序 | 记录长度（以16位整数表示） |

​        在记录头的后面就是实际的记录：

| 字节 | 类型  | 字节序 | 用途                 |
| ---- | ----- | ------ | -------------------- |
| 0–3  | int32 | 小端序 | 图形类型（参见下面） |
| 4–   | -     | -      | 图形内容             |

​        变长记录的内容由图形的类型决定。Shapefile支持以下的图形类型：

| 值   | 图形类型                        | 字段                                                         |
| ---- | ------------------------------- | ------------------------------------------------------------ |
| 0    | 空图形                          | 无                                                           |
| 1    | Point（点）                     | X, Y                                                         |
| 3    | Polyline（折线）                | （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点 |
| 5    | Polygon（多边形）               | （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点 |
| 8    | MultiPoint（多点）              | （最小包围矩形）MBR，点的数目，所有点                        |
| 11   | PointZ（带Z与M坐标的点）        | X, Y, Z, M                                                   |
| 13   | PolylineZ（带Z或M坐标的折线）   | *必须的*: （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点，Z坐标范围, Z坐标数组 *可选的*: M坐标范围, M坐标数组 |
| 15   | PolygonZ（带Z或M坐标的多边形）  | *必须的*: （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点，Z坐标范围, Z坐标数组 *可选的*: M坐标范围, M坐标数组 |
| 18   | MultiPointZ（带Z或M坐标的多点） | *必须的*: （最小包围矩形）MBR，点的数目，所有点， Z坐标范围, Z坐标数组 *可选的*: M坐标范围, M坐标数组 |
| 21   | PointM（带M坐标的点）           | X, Y, M                                                      |
| 23   | PolylineM（带M坐标的折线）      | *必须的*: （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点 *可选的*: M坐标范围, M坐标数组 |
| 25   | PolygonM（带M坐标的多边形）     | *必须的*: （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点 *可选的*: M坐标范围, M坐标数组 |
| 28   | MultiPointM（带M坐标的多点）    | *必须的*: （最小包围矩形）MBR，点的数目，所有点 *可选的*: M坐标范围, M坐标数组 |
| 31   | MultiPatch                      | *必须的*: （最小包围矩形）MBR，组成部分数目，点的数目，所有组成部分，所有点，Z坐标范围, Z坐标数组 *可选的*: M坐标范围, M坐标数组 |

#### 三、shp 文件读取

​        首先新建Html的input元素和canvas元素，当shp文件上传成功后，通过[FileReader](https://developer.mozilla.org/zh-CN/docs/Web/API/FileReader)读取shp文件，然后将对应的图形绘制到Canvas上。

html页面部分：

```html
    <input type="file" id="file" onchange="readAsArrayBuffer()" />
    <canvas id="canvas" width="800" height="800"></canvas>
```

parseHeader函数解析shp的头文件
parseShape行数解析shp文件的坐标信息
darwShape函数将坐标信息绘制到Canvas上

Javascript代码:

```javascript
var file = document.getElementById("file");
    var canvas = document.getElementById("canvas");
    var context = canvas.getContext("2d");
    context.strokeStyle = "rgba(0,0,0,1)";
    var width = canvas.width;
    var height = canvas.height;

    function readAsArrayBuffer(e) {
        context.clearRect(0, 0, width, height);
        var shp = file.files[0];
        var reader = new FileReader();
        reader.readAsArrayBuffer(shp);
        reader.onload = function(f) {
            var dataView = new DataView(this.result);
            var pos = 0;
            var header = parseHeader(dataView, pos);
            pos = header.pos;
            while (pos < header.byteLength) {
                try {
                    var shape = parseShape(dataView, pos);
                    pos = shape.pos;
                    darwShape(header, shape);
                } catch (e) {
                    console.log(e);
                    break;
                }
            }
        }
    }

    function darwShape(header, shape) {
        var xWidth = header.maxX - header.minX;
        var yHeight = header.maxY - header.minY;
        var i = 0;
        var x, y;
        context.fillStyle = "rgba(255,0,0,0.6)";
        switch (shape.type) {
            case 1: // Point
            case 11: // PointZ
            case 21: // PointM
                var point = shape.coordinates;
                if (header.maxX == header.minX || header.maxY == header.minY) {
                    context.fillRect(width / 2, height / 2, 10, 10);
                } else {
                    x = (point[0] - header.minX) / xWidth * width;
                    y = (yHeight - (point[1] - header.minY)) / yHeight * height;
                    context.fillRect(x - 5, y - 5, 10, 10);
                }
                break;
            case 8: // MultiPoint
            case 18: // MultiPointZ          
            case 28: // MultiPointM
                var points = shape.coordinates;
                for (; i < points.length; i++) {
                    x = (points[i][0] - header.minX) / xWidth * width;
                    y = (yHeight - (points[i][1] - header.minY)) / yHeight * height;
                    context.fillRect(x - 5, y - 5, 10, 10);
                }
                break;
            case 3: // Polyline
            case 13: // PolylineZ
            case 23: // PolylineM
                var paths = shape.coordinates;
                for (; i < paths.length; i++) {
                    context.beginPath();
                    for (var j = 0; j < paths[i].length; j++) {
                        x = (paths[i][j][0] - header.minX) / xWidth * width;
                        y = (yHeight - (paths[i][j][1] - header.minY)) / yHeight * height;
                        if (j == 0) {
                            context.moveTo(x, y);
                        } else {
                            context.lineTo(x, y);
                        }
                    }
                    context.stroke();
                }
                break;
            case 5: // Polygon
            case 15: // PolygonZ
            case 25: // PolygonM
                var rings = shape.coordinates.slice(0);
                // Judging that the previous polygon has been drawed
                for (; i < rings.length; i++) {
                    var clockwise = isClockwise(rings[i]);
                    if (!clockwise) {
                        var gCenter=calcGravityCenter(rings[i]);
                        x = (gCenter[0] - header.minX) / xWidth * width;
                        y = (yHeight - (gCenter[1] - header.minY)) / yHeight * height;
                        var pickData = context.getImageData(x, y, 1, 1).data;
                        if(pickData[0]!=0||pickData[1]!=0||pickData[2]!=0||pickData[3]!=0){
                            rings.splice(i,1);
                            i--;
                        }
                    }
                }

                i = 0;
                for (; i < rings.length; i++) {
                    var clockwise = isClockwise(rings[i]);
                    if (clockwise) {
                        context.beginPath();
                        for (var j = 0; j < rings[i].length; j++) {
                            x = (rings[i][j][0] - header.minX) / xWidth * width;
                            y = (yHeight - (rings[i][j][1] - header.minY)) / yHeight * height;
                            if (j == 0) {
                                context.moveTo(x, y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }
                        context.closePath();
                        context.stroke();
                        context.fill();
                    }
                }
                context.globalCompositeOperation = 'destination-out';
                context.fillStyle = "rgba(255,255,255,1)";
                i = 0;
                for (; i < rings.length; i++) {
                    var clockwise = isClockwise(rings[i]);
                    if (!clockwise) {
                        context.beginPath();
                        for (var j = 0; j < rings[i].length; j++) {
                            x = (rings[i][j][0] - header.minX) / xWidth * width;
                            y = (yHeight - (rings[i][j][1] - header.minY)) / yHeight * height;
                            if (j == 0) {
                                context.moveTo(x, y);
                            } else {
                                context.lineTo(x, y);
                            }
                        }
                        context.closePath();
                        context.stroke();
                        context.fill();
                    }
                }
                context.globalCompositeOperation = 'source-over';
                break;
        }
    }

    function isClockwise(ring) {
        if (ring.length < 3) {
            return -1;
        }
        var i = 0,
            j = 0;
        var area = 0;
        for (; i < ring.length; i++) {
            j = (i + 1) % ring.length;
            area += ring[i][0] * ring[j][1];
            area -= ring[j][0] * ring[i][1];
        }
        return (area < 0);
    }

    function calcGravityCenter(ring) {
        var xmin=Number.MAX_VALUE;
        var ymin=Number.MAX_VALUE;
        var i=0;
        for(;i<ring.length;i++){
            if(ring[i][0]<xmin){
                xmin=ring[i][0];
            }
            if(ring[i][1]<ymin){
                ymin=ring[i][1];
            }
        }
        var momentX = 0;
        var momentY = 0;
        var weight = 0;
        i=0;
        for(;i<ring.length;i++){
            var p1 = ring[i];
            var p2;
            if (i == ring.length - 1) {
                p2 = ring[0];
            } else {
                p2 = ring[i+1];
            }
            var dWeight = (p1[0] - xmin) * (p2[1] - p1[1]) -
                (p1[0] - xmin) * (ymin - p1[1]) / 2 -
                (p2[0] - xmin) * (p2[1] - ymin) / 2 -
                (p1[0] - p2[0]) * (p2[1] - p1[1]) / 2;
            weight += dWeight;
            var pTmp = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
            var gravityX = xmin + (pTmp[0] - xmin) * 2 / 3;
            var gravityY = ymin + (pTmp[1] - ymin) * 2 / 3;
            momentX += gravityX * dWeight;
            momentY += gravityY * dWeight;
        }
        return [momentX / weight, momentY / weight];
    }

    /**
     * read the shp header info .
     *
     * @param dataView The DataView containing the main shapefile.
     * @param pos The start position of DataView.
     */
    function parseHeader(dataView, pos) {
        var header = {};
        header.fileCode = dataView.getInt32(pos, false);
        if (header.fileCode != 0x0000270a) {
            throw (new Error("Unknown file code: " + header.fileCode));
        }
        pos += 4;
        pos += 5 * 4; //unused
        var wordLength = dataView.getInt32(pos, false); //bigEndian  the total length of the file in 16-bit words
        header.byteLength = wordLength * 2;
        pos += 4;
        header.version = dataView.getInt32(pos, true); //littleEndian
        pos += 4;
        header.shapeType = dataView.getInt32(pos, true);
        pos += 4;
        header.minX = dataView.getFloat64(pos, true);
        header.minY = dataView.getFloat64(pos + 8, true);
        header.maxX = dataView.getFloat64(pos + 16, true);
        header.maxY = dataView.getFloat64(pos + 24, true);
        header.minZ = dataView.getFloat64(pos + 32, true);
        header.maxZ = dataView.getFloat64(pos + 40, true);
        header.minM = dataView.getFloat64(pos + 48, true);
        header.maxM = dataView.getFloat64(pos + 56, true);
        pos += 8 * 8;
        header.pos = pos;
        return header;
    }

    /**
     * read the shp content.
     *
     * @param dataView The DataView containing the main shapefile.
     * @param pos The start position of DataView.
     */
    function parseShape(dataView, pos) {
        var shape = {};
        shape.number = dataView.getInt32(pos, false); //bigEndian
        pos += 4;
        shape.length = dataView.getInt32(pos, false) * 2; //bigEndian
        pos += 4;
        shape.type = dataView.getInt32(pos, true); //littleEndian
        pos += 4;

        var i = 0;
        var coordinates = [];
        switch (shape.type) {
            case 0: // Null
                break;
            case 1: // Point (x,y)
            case 11: // PointZ (X, Y, Z, M)
            case 21: // PointM (X, Y, M)
                var point = [dataView.getFloat64(pos, true), dataView.getFloat64(pos + 8, true)];
                pos += 16;
                coordinates = point;
                if (shape.type == 11) {
                    pos += 8; //read z value float64
                    pos += 8; //read m value float64
                }
                if (shape.type == 21) {
                    pos += 8; //read m value float64
                }
                shape.coordinates = coordinates;
                break;
            case 8: // MultiPoint (MBR, pointCount, points)
            case 18: // MultiPointZ                 
            case 28: // MultiPointM
                var minX = dataView.getFloat64(pos, true);
                var minY = dataView.getFloat64(pos + 8, true);
                var maxX = dataView.getFloat64(pos + 16, true);
                var maxY = dataView.getFloat64(pos + 24, true);
                var pointCount = dataView.getInt32(pos + 32, true); //x y
                pos += 36; //8*4+4
                for (i = 0; i < pointCount; i++) {
                    var point = [dataView.getFloat64(pos, true), dataView.getFloat64(pos + 8, true)];
                    pos += 16;
                    coordinates.push(point);
                }
                if (shape.type == 18) {
                    pos += 8; //zmin
                    pos += 8; //zmax
                    pos += pointCount * 8; //read z values float64

                    pos += 8; //mmin
                    pos += 8; //mmax
                    pos += pointCount * 8; //read m values float64
                }
                if (shape.type == 28) {
                    pos += 8; //mmin
                    pos += 8; //mmax
                    pos += pointCount * 8; //read m values float64
                }
                shape.extent = {
                    minX: minX,
                    minY: minY,
                    maxX: maxX,
                    maxY: maxY
                };
                shape.coordinates = coordinates;
                break;
            case 3: // Polyline
            case 13: // PolylineZ
            case 23: // PolylineM
            case 5: // Polygon
            case 15: // PolygonZ
            case 25: // PolygonM
                var minX = dataView.getFloat64(pos, true);
                var minY = dataView.getFloat64(pos + 8, true);
                var maxX = dataView.getFloat64(pos + 16, true);
                var maxY = dataView.getFloat64(pos + 24, true);
                var parts = new Int32Array(dataView.getInt32(pos + 32, true));
                var pointCount = dataView.getInt32(pos + 36, true); //x y
                pos += 40; //8*4+4+4

                for (i = 0; i < parts.length; i++) {
                    parts[i] = dataView.getInt32(pos, true);
                    pos += 4;
                    coordinates.push([]);
                }
                var p = 1;
                for (i = 0; i < pointCount; i++) {
                    var point = [dataView.getFloat64(pos, true), dataView.getFloat64(pos + 8, true)];
                    pos += 16;
                    if (p >= parts.length) {
                        coordinates[p - 1].push(point);
                    } else {
                        if (i < parts[p]) {
                            coordinates[p - 1].push(point);
                        } else {
                            p++
                        }
                    }
                }
                if (shape.type == 15 || shape.type == 13) {
                    pos += 8; //zmin
                    pos += 8; //zmax
                    pos += pointCount * 8; //read z values float64

                    pos += 8; //mmin
                    pos += 8; //mmax
                    pos += pointCount * 8; //read m values float64
                }
                if (shape.type == 25 || shape.type == 23) {
                    pos += 8; //mmin
                    pos += 8; //mmax
                    pos += pointCount * 8; //read m values float64
                }
                shape.extent = {
                    minX: minX,
                    minY: minY,
                    maxX: maxX,
                    maxY: maxY
                };
                shape.coordinates = coordinates;
                break;
            case 31: // MultiPatch
                throw new Error("Shape type not supported: " + shape.type);
            default:
                throw new Error("Unknown shape type at " + (pos - 4) + ': ' + shape.type);
        }
        shape.pos = pos;
        return shape;
    }
```

#### 四、结果

![JS加载shp](./img/JS加载shp.jpg)

#### 资料

[shapefile白皮书](https://www.esri.com/library/whitepapers/pdfs/shapefile.pdf)

