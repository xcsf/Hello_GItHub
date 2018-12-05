## 关于ArcPy的坑

### 一、X,Y生成的事件图层没有OID字段，某些工具无法直接使用，需要转成要素类。

### 二、 需要给某个要素类属性表添加连接表

1. 输入必须为图层：Mosaic Layer; Raster Layer; Table View，所以需要将要素先转为图层使用方法:

   ```python
   arcpy.MakeFeatureLayer_management("in_memory" + "\\" + "featureclass" , "layer")
   ```

2. 输入图层或表视图必须有 ObjectID 字段连接表不必包含 ObjectID 字段。

3. 连接仅在会话期间有效。要保存表中属性至要素中的话，使用工具将图层保存为要素类。此方法仅适用于图层，表视图不能使用此方式进行保存。使用方法如下：

   ```python
   arcpy.FeatureClassToFeatureClass_conversion("layer", out_path = outputFile, out_name = FeatureName)
   ```

4. 注意，如果不是保存为要素类，而是保存为图层文件，保存后可以看到要素数据集中的本属于连接表的字段名在要素属性表中会默认加上sheet名的前缀。
   这里我们保存为要素类，要....

   (防止后面使用该字段时出现错误，得看清楚字段名情况)

   ```python
   arcpy.env.qualifiedFieldNames = "UNQUALIFIED"
   ```

   下面是官方一些解释

> # 限定的字段名（环境设置）
>
> 遵循“限定的字段名”环境的工具将使用此设置来区分限定的字段名和未限定的字段名。限定的字段名是要素类或表中的这样一些字段名称，在它们的字段名称后会附加原始要素类或表的名称。使用连接数据时，会涉及此设置。
>
> ## 用法说明
>
> - 默认限定的输出表字段命名结构为“表名.字段名”。当未限定时，输出表或要素类中的字段将始终用格式字段名命名。
> - 在限定的字段名可能超出允许的字段名宽度时，应将环境设为 UNQUALIFIED - 例如，连接 shapefile 时。Shapefile 字段将截短为八个字符。
>
> 当工具参数中包含字段映射时（“转换”工具箱的许多工具中都包括），字段名自动设置为 UNQUALIFIED，因此无需设置该环境。脚本语法
>
> arcpy.env.qualifiedFieldNames = qualified_field_names
>
> | qualified_field_names | 说明                                                         |
> | --------------------- | ------------------------------------------------------------ |
> | True                  | 输出字段名包括表名。这也可以使用 QUALIFIED 关键字设置。这是默认设置。 |
> | False                 | 输出字段名将不包括表名。这也可以使用 UNQUALIFIED 关键字设置。 |