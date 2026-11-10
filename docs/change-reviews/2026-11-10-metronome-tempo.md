# 节拍器速度预设双端评估

- 需求为按慢速、中速、快速分组增加预设，底部改为 −10／+10 BPM，进入时默认 60 BPM。
- 网页基线 `aa14c69`、微信小程序基线 `849da7b` 加本地节拍器，两端同步修改独立节拍器的设置、速度按钮和本机存储。继续保存拍号和细分，忽略旧记录中的 BPM。
- 区间采用 [Sacramento Music 的 Basic Tempo Markings](https://playmusicsacramento.com/uploads/1/3/4/9/134903462/basic-tempo-markings.pdf)，区间重叠是允许的。预设取区间中点四舍五入，Prestissimo 的显示范围受本工具的 240 BPM 上限约束。
- 用预设确认与取消、步进上下限、返回后恢复 60 BPM 且保留拍号和细分核对两端。网页版按 GitHub Pages 流程部署，小程序本次保持本地开发，尚待真机验收和独立上传。
