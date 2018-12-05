## 关于ArcPy的坑

#### 在直接使用Excel文件时，本地可以调用成功能，发布后无法找到对应路径文件。

* 解决办法：

  使用Excel 转表，将磁盘中的表格输出到gdb中，从File类型转为Table类型。

> # Excel 转表
>
> ## 摘要
>
> 将 Microsoft Excel 文件转换为表。
>
> ## 用法
>
> - Excel 转表支持 Excel 工作簿 (.xlsx) 和 Microsoft Excel 5.0/95 工作簿 (.xls) 格式作为输入。
> - 此工具假设表数据按纵向排序。第一行用作输出表的字段名称。在验证过程中，可能会对这些字段名称重命名，以免出现任何错误或重复名称。数据间的空列将得到保留，并为其指定通用字段名（例如 field_4）。
> - 输出字段数据类型基于输入列范围内找到的值和像元格式。输出字段数据类型包括浮点型、文本和日期。如果输入列包含多个数据类型或格式类型，则输出字段的类型为文本。
>
> ## 语法
>
> ```python
> ExcelToTable_conversion (Input_Excel_File, Output_Table, {Sheet})
> ```
>
> | 参数             | 说明                                                         | 数据类型 |
> | ---------------- | ------------------------------------------------------------ | -------- |
> | Input_Excel_File | 要转换的 Microsoft Excel 文件。                              | File     |
> | Output_Table     | 输出表。                                                     | Table    |
> | Sheet(可选)      | 要导入的 Excel 文件中特定工作表的名称。如果未指定，则使用工作簿中的第一个工作表。 | String   |

## 代码示例
```python
input_table = outTempTable + "/connect$"
arcpy.ExcelToTable_conversion(Input_Excel_File = outTempTable, Output_Table = "connect", Sheet = "connect")
```

