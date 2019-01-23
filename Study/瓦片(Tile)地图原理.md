## 瓦片(Tile)地图原理与加载

### 1. 什么是瓦片地图

​	我们在网上浏览地图比如常见的：高德、谷歌、Bing、腾讯地图、百度地图、OpenStreetMap。地图加载时是一个方块一个方块加载显示出来。这种地图加载方式就是将地图（就是张图片）按照详细程度等级制作成各个等级的瓦片（还是张图片），结构如下图。根据用户缩放情况 显示不同等级的地图图片。

**一些基本特性：**

   	1. [参考椭球](https://zh.wikipedia.org/wiki/%E5%8F%82%E8%80%83%E6%A4%AD%E7%90%83%E4%BD%93)：WGS84
   	2. 投影：[墨卡托投影](https://zh.wikipedia.org/wiki/%E9%BA%A5%E5%8D%A1%E6%89%98%E6%8A%95%E5%BD%B1%E6%B3%95)、[Web_Mercator](https://en.wikipedia.org/wiki/Mercator_projection#Web_Mercator)
   	3. 当经度范围在[-180,180]，投影为正方形时，纬度范围：[-85.05113, 85.05113]
   	4. 图片大小：256*256
   	5. 图片格式：jpg[有损压缩率高、不透明]   png[无损、透明]

![瓦片原理图1](./img/瓦片原理图1.png)

### 2. 为什么使用瓦片地图

​	1）**瓦片地图缓存非常高效**。如果你曾查看中央公园的地图而下载过曼哈顿的瓦片，当你需要显示泽西城的地图时，你的浏览器可以使用之前缓存的相同的瓦片，而不是重新再下载一次。

​	2）**瓦片地图可以渐进加载**。即使当前地图的边缘部分还没有加载完成，也可以缩放移动到其他地方。

​	3）**瓦片地图简单易用**。描述地图瓦片的坐标系统很简单，使得很容易在服务器、网络、桌面或移动设备上实现技术集成。

​	4）**传输效率高、减少服务器压力**。由于地图内容会跟着用户缩放程度进行一定的简化和隐藏，这一切如果动态由服务器计算后返回，效率大大降低，而预先为地图分好固定等级，将地图作为图片存储在服务端，更据请求只返回特定的地图图片则简便高效很多。

### 3. 瓦片地图怎么做出来的

​	通常找软件生成去吧。。。基本原理过程就是：

![瓦片原理图2](./img/瓦片原理图2.png)

​	**第一点**：地球是个近似球体。要转为平面的地图需要投影。或者直接使用正射影像当瓦片用咯。

​	**第二点**：投影完后，就按照地图详细等级进行切分。最高级（level = 0）,需要的信息最少，最宏观，就是一张256\*256像素图片，下一级（level = 1）精细一些，就是512\*512像素，以此类推。最后就成了个金字塔的体系。

​	**第三点**：每张图片都是同样大小的图片，通常会都切分为**256\*256**大小的图片，这就是**瓦片**了。算一算就知道，（level = 0）一张瓦片，到（level = 1）四张瓦片........



### 4. 瓦片怎么加载到正确的位置的

​	要在浏览器上把每个切片放到正确的位置，保证拼接正确，就要将每个瓦片进行**编号**，有了编号后就知道每个瓦片对应加载的位置，此处可以脑补拼图。下面先了解下编号的规则。

> **谷歌XYZ**：Z表示缩放层级，Z=zoom；XY的原点在左上角，X从左向右，Y从上向下。
>
> **TMS**：开源产品的标准，Z的定义与谷歌相同；XY的原点在左下角，X从左向右，Y从下向上。
>
> **QuadTree**：微软Bing地图使用的编码规范，Z的定义与谷歌相同，同一层级的瓦片不用XY两个维度表示，而只用一个整数表示，该整数服从四叉树编码规则
>
> **百度XYZ**：Z从1开始，在最高级就把地图分为四块瓦片；XY的原点在经度为0纬度位0的位置，X从左向右，Y从下向上。	

![瓦片原理图3](./img/瓦片原理图3.png)

​	编好了号，瓦片做好了，就是一堆文件夹里放着图片。直观点就是下图：

​	文件夹名字表示级别： ![瓦片原理图4](./img/瓦片原理图4.png)

​	点开21级文件夹，文件夹名表示x：![瓦片原理图5](./img/瓦片原理图5.png)

​	再打开文件夹就是图片了,名字就是y：![瓦片原理图6](./img/瓦片原理图6.png)

​	*.kml文件里面存了写坐标信息有需要可以读取，这里先不管它。

### 5.瓦片的加载方法

​	有了瓦片，再简单的说下加载瓦片地图的**基本思路**：

​	1. 要根据用户缩放程度算出显示范围所对应的瓦片的**x、y、z**（leve）（也可以说是行列号）。

​	2. 接下来就再对应的位置，获取并加载上对应的x、y、z的瓦片。

​	3. 必要的一些缩放功能，平移等等基本的地图浏览操作。

​	上面说的很简单，但是要自己实现的话还是很麻烦的对吧。所以上面这些，基本都有现成JS库帮我们去完成。而瓦片无特殊要求的话，去获取，高德、谷歌、OSM、腾讯等等都可以很方便。下面是简单的加载天地图瓦片地图服务的例子，使用的ArcGIS API for JavaScript，官方教程也很多可以看看。

```javascript
var MyCustomTileLayer = BaseTileLayer.createSubclass({
    // properties of the custom tile layer
    properties: {
        urlTemplate: null,
    },
    // override getTileUrl()
    // generate the tile url for a given level, row and column
    getTileUrl: function (level, row, col) {
        return this.urlTemplate.replace("{z}", level).replace("{x}", col).replace("{y}", row).replace("{tag}", col % 8);
    }
});
var TDMap = new MyCustomTileLayer({
    urlTemplate: "http://t{tag}.tianditu.gov.cn/DataServer?T=vec_w&x={x}&y={y}&l={z}",
    tint: "#71DE6E", // blue color
    title: "TD Map",
});
var myMap = new Map({
    layers: [TDMap]
});
var view = new SceneView({
    container: "viewDiv",
    map: myMap,
});

```

​	**不太明白的看看这个：**

​	 我们天地图官网上打开地图时候F12里找到的请求：参数就有x、y、l（leve），再看上面的代码getTileUrl函数，帮我们把算出来的三个参数替换到url中去请求到对应的瓦片，tag是天地图有好几个瓦片服务地址任意取一个数，暂时可以不管。

![1545275443310](C:\Users\Mr_Yin\AppData\Roaming\Typora\typora-user-images\1545275443310.png)

​	url搞定了剩下的就是造个layer造个map加到view中。

### 6. 加载自定义的瓦片

​	上面我们用的是天地图的瓦片，我们很多时候需要加载自己的做好的瓦片,现在我们以上面截图的那些做好的瓦片文件为例，写个属于自己的瓦片地图的服务：

##### 这里用.NET Web API实现

其实思路简单：

1. 按照`x，y，z`去得到对应瓦片的文件路径，`x、y、z`是url里传过来的。

2. 将获取到的图片返回

   ##### Modles：

```c#
public string getImage(string mt, string version, string x, string y, string z)
{
    try
    {
        //由于采用的瓦片编号为TMS
        //而我们使用ArcGIS JS API来加载 其默认为Google瓦片编码规则
        //所以这里将y值进行简单换算
        y = (Math.Pow(2, Convert.ToInt32(z)) - Convert.ToInt32(y) - 1).ToString();
        
        //取对应路径下的图片
        string currentPath = System.Web.Hosting.HostingEnvironment.MapPath("~/") + @"tiles";
        if (File.Exists(currentPath + "/" + mt + "/" + version + "/" + z + "/" + x + "/" + y + ".png"))
        {
            imgpath = currentPath + "/" + mt + "/" + version + "/" + z + "/" + x + "/" + y + ".png";
        }
        else
        {
            imgpath = currentPath + "/Northophoto.png";
        }
        return imgpath;
    }
    catch (Exception ex)
    {
        return null;
    }
}
```

##### Controller:

```c#
public class testController : ApiController
    {
    [HttpGet]
    //主要就是xyz 其他自定义的参数，可以不用管
    public HttpResponseMessage Foo(string mt, string version, string x, string y, string z)
    {
        try
        {
            TestClass modclass = new TestClass();
            var imgPath = modclass.getImage(mt, version, x, y, z);
            FileStream fs = new FileStream(imgPath, FileMode.Open);
            HttpResponseMessage resp = new HttpResponseMessage(HttpStatusCode.OK);
            resp.Content = new StreamContent(fs);
            resp.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpg");
            return resp;
        }
        catch (Exception)
        {
            return null;
        }
    }
}
```

​	这样前端调用相应的URL并带上的相应的参数 **具体xyz参数值由ArcGIS JS API得出**

	> ps：具体怎么算出来的看下一篇文章。

​	下面我们看看简单的使用ArcGIS JS API加载瓦片的方法，和上面加载天地图差不多，但是参数使要根据我们上一步定义的参数来传递，具体也可以去看看Esri的官方API文档：

```javascript
var MyCustomTileLayer = BaseTileLayer.createSubclass({
    // properties of the custom tile layer
    properties: {
        urlTemplate: null,
    },
    // override getTileUrl()
    // generate the tile url for a given level, row and column
    getTileUrl: function (level, row, col) {
        return this.urlTemplate.replace("{z}", level).replace("{x}", col).replace("{y}", row).replace("{tag}", col % 8);
    }
});

var Tile = new MyCustomTileLayer({
    urlTemplate: "http://localhost:62881/api/test?mt=测试&version=20181210&x={x}&y={y}&z={z}",
    title: "Tile",
});

```

​	这样底图图层就创建出来了，接下来就可以直接使用：

![瓦片原理图7](./img/瓦片原理图7.png)