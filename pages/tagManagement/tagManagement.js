// d:\01-codes\calendar\calendar_1.1\calendar\pages\tagManagement\tagManagement.js
Page({
  data: {
    allTags: [], // 存储所有标签
    showCreateTagPopup: false, // 控制新建标签弹窗的显示
    newTagTitle: '',
    newTagColor: '#1E90FF', // 默认颜色
    newIsAllDay: true, // 默认全天
    newStartTime: '09:00',
    newEndTime: '10:00',
    colors: ['#FFC0CB', '#F5DEB3', '#ADD8E6', '#d5d755', '#3fa9f5', '#87CEEB', '#90EE90', '#00b392', '#BDB76B', '#bb80d1', '#DDA0DD', '#A0522D', '#ff4c00', '#FFC000', '#E97451', '#40E0D0', '#CD69C9', '#66CD00', '#9370D', '#CDC9C9'], // 可选颜色
    startX: 0, // 触摸开始时的X坐标
    startY: 0, // 触摸开始时的Y坐标
    currentTagIdSwiped: null, // 当前被滑动打开的标签ID
    slideBtnWidth: 150, // 删除按钮的宽度 (rpx)，需与wxss中保持一致
    rpxRatio: 1, // 新增：用于px到rpx的转换比例
  },

  onLoad: function (options) {
    // 页面加载时执行
    this.loadTags();
    // 获取系统信息，计算rpx与px的转换比例
    wx.getSystemInfo({
      success: (res) => {
        this.setData({
          rpxRatio: 750 / res.windowWidth
        });
      }
    });
    
    // 显示缓存加载成功提示
    wx.showToast({
      title: '标签数据已加载',
      icon: 'success',
      duration: 1000
    });
  },

  onShow: function () {
    // 页面显示/从其他页面返回时执行，确保标签列表是最新的
    this.loadTags();
  },
  
  // 页面隐藏时保存数据
  onHide: function () {
    this.saveDataToStorage();
  },
  
  // 页面卸载时保存数据
  onUnload: function () {
    this.saveDataToStorage();
  },
  
  // 保存数据到本地存储
  saveDataToStorage: function () {
    // 保存标签数据到本地存储
    wx.setStorageSync('allTags', this.data.allTags);
  },

  /**
   * 加载所有标签
   */
  loadTags: function () {
    const allTags = wx.getStorageSync('allTags') || [];
    // 为每个标签项添加或重置slideOffset属性，用于控制滑动位置
    const tagsWithOffset = allTags.map(tag => ({ ...tag, slideOffset: 0 }));
    this.setData({
      allTags: tagsWithOffset,
      currentTagIdSwiped: null // 重新加载时关闭所有滑动
    });
  },

  /**
   * 点击新建标签按钮
   */
  onAddTagClick: function () {
    // 如果有标签处于滑动状态，先关闭
    if (this.data.currentTagIdSwiped) {
      this.closeSwipedTag();
    }
    this.setData({
      showCreateTagPopup: true,
      // 重置表单字段
      newTagTitle: '',
      newTagColor: this.data.colors[0] || '#1E90FF',
      newIsAllDay: true,
      newStartTime: '09:00',
      newEndTime: '10:00',
    });
  },

  /**
   * 隐藏新建标签弹窗
   */
  hideCreateTagPopup: function () {
    this.setData({
      showCreateTagPopup: false
    });
  },

  /**
   * 标题输入
   */
  onTitleInput: function (e) {
    this.setData({
      newTagTitle: e.detail.value
    });
  },

  /**
   * 颜色选择
   */
  onColorSelect: function (e) {
    this.setData({
      newTagColor: e.currentTarget.dataset.color
    });
  },

  /**
   * 全天事件开关
   */
  onAllDayChange: function (e) {
    this.setData({
      newIsAllDay: e.detail.value
    });
  },

  /**
   * 开始时间选择
   */
  onStartTimeChange: function (e) {
    const newStartTime = e.detail.value;
    // 解析开始时间
    const [startHour, startMinute] = newStartTime.split(':').map(Number);

    // 计算结束时间：开始时间后1小时
    let endHour = startHour + 1;
    if (endHour >= 24) {
      endHour = endHour - 24; // 跨越到第二天
    }
    const endMinute = startMinute;

    // 格式化结束时间为 HH:MM 字符串
    const newEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

    this.setData({
      newStartTime: newStartTime,
      newEndTime: newEndTime // 自动更新结束时间
    });
  },

  /**
   * 结束时间选择
   */
  onEndTimeChange: function (e) {
    this.setData({
      newEndTime: e.detail.value
    });
  },

  /**
   * 保存新标签
   */
  saveNewTag: function () {
    const { newTagTitle, newTagColor, newIsAllDay, newStartTime, newEndTime } = this.data;

    if (!newTagTitle) {
      wx.showToast({
        title: '标签标题不能为空',
        icon: 'none'
      });
      return;
    }

    let currentallTags = wx.getStorageSync('allTags') || [];

    // 检查是否已存在相同标题的标签
    const isDuplicate = currentallTags.some(tag => tag.title === newTagTitle);
    if (isDuplicate) {
      wx.showToast({
        title: '标签已存在',
        icon: 'none'
      });
      return;
    }
    const newTag = {
      id: Date.now() + Math.random().toString(36).substr(2, 9), // 唯一 ID
      title: newTagTitle,
      color: newTagColor,
      isAllDay: newIsAllDay,
      startTime: newStartTime,
      endTime: newEndTime,
      slideOffset: 0 // 新增标签时初始化slideOffset
    };

    currentallTags.push(newTag); // 将新标签添加到从本地存储获取的数组中

    this.setData({
      allTags: currentallTags, // 更新页面的 data
      showCreateTagPopup: false,
      newTagTitle: '', // 清空表单
      newTagColor: this.data.colors[0] || '#1E90FF',
      newIsAllDay: true,
      newStartTime: '09:00',
      newEndTime: '10:00',
    });
    
    // 保存到本地存储
    this.saveDataToStorage();

    wx.showToast({
      title: '标签保存成功',
      icon: 'success'
    });
  },
  /**
   * 触摸开始事件
   */
  onTouchStart: function (e) {
    // 如果有其他标签处于滑动状态，先关闭
    if (this.data.currentTagIdSwiped) {
      this.closeSwipedTag();
    }
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    });
  },

  /**
   * 触摸移动事件
   */
  onTouchMove: function (e) {
    const { startX, startY, slideBtnWidth, allTags, rpxRatio } = this.data;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX_px = currentX - startX; // 计算像素差
    const deltaY = currentY - startY;
    const tagId = e.currentTarget.dataset.id;

    // 判断是水平滑动还是垂直滑动
    if (Math.abs(deltaX_px) > Math.abs(deltaY)) { // 使用像素差进行判断
      // 水平滑动，阻止页面垂直滚动
      // e.preventDefault(); // 小程序中通常不需要手动阻止，flex布局会处理
      const deltaX_rpx = deltaX_px * rpxRatio; // 将像素差转换为rpx
      let newOffset = 0;
      if (deltaX_rpx < 0) { // 左滑
        newOffset = Math.max(-slideBtnWidth,deltaX_rpx); // 使用rpx值进行比较
      } else { // 右滑
        newOffset = Math.min(0, deltaX_rpx); // 使用rpx值进行比较
      }

      const updatedTags = allTags.map(tag => {
        if (tag.id === tagId) {
          return { ...tag, slideOffset: newOffset };
        }
        return tag;
      });

      this.setData({
        allTags: updatedTags
      });
    }
  },

  /**
   * 触摸结束事件
   */
  onTouchEnd: function (e) {
    const { slideBtnWidth, allTags, rpxRatio } = this.data;
    const tagId = e.currentTarget.dataset.id;
    const currentTag = allTags.find(tag => tag.id === tagId);

    if (!currentTag) return;

    // 确保 slideOffset 也是 rpx 值，这里不需要再次转换，因为onTouchMove已经处理了
    let finalOffset = 0;
    if (currentTag.slideOffset < -slideBtnWidth / 2) { // 滑动距离超过一半，则完全打开
      finalOffset = -slideBtnWidth;
      this.setData({
        currentTagIdSwiped: tagId
      });
    } else { // 否则，关闭
      finalOffset = 0;
      this.setData({
        currentTagIdSwiped: null
      });
    }

    const updatedTags = allTags.map(tag => {
      if (tag.id === tagId) {
        return { ...tag, slideOffset: finalOffset };
      }
      return tag;
    });

    this.setData({
      allTags: updatedTags
    });
  },

  /**
   * 关闭当前已滑动的标签
   */
  closeSwipedTag: function () {
    const { currentTagIdSwiped, allTags } = this.data;
    if (currentTagIdSwiped) {
      const updatedTags = allTags.map(tag => {
        if (tag.id === currentTagIdSwiped) {
          return { ...tag, slideOffset: 0 };
        }
        return tag;
      });
      this.setData({
        allTags: updatedTags,
        currentTagIdSwiped: null
      });
    }
  },

  /**
   * 删除标签
   */
  onDeleteTag: function (e) {
    const tagIdToDelete = e.currentTarget.dataset.id;
    console.log('尝试删除标签，ID:', tagIdToDelete); // 新增日志
    wx.showModal({
      title: '确认删除',
      content: '确定要删除此标签吗？',
      success: (res) => {
        if (res.confirm) {
          let allTags = wx.getStorageSync('allTags') || [];
          console.log('删除前从存储获取的标签:', allTags); // 新增日志
          const updatedTags = allTags.filter(tag => tag.id !== tagIdToDelete);
          console.log('删除后剩余的标签:', updatedTags); // 新增日志
          
          this.setData({
            allTags: updatedTags,
            currentTagIdSwiped: null // 删除后重置滑动状态
          });
          
          // 保存到本地存储
          this.saveDataToStorage();

          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          });
        } else {
          // 用户取消删除，关闭滑动
          this.closeSwipedTag();
        }
      }
    });
  },
});