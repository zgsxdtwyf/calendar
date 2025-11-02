// dataManagement.js
Page({
  data: {
    lastBackupTime: '', // 上次备份时间
    backupReminder: true, // 是否开启备份提醒
    reminderInterval: 7, // 默认提醒间隔（天）
    reminderIntervalOptions: ['3', '7', '14', '30'], // 提醒间隔选项
    showReminderSettingPopup: false, // 控制提醒设置弹窗显示
  },

  onLoad: function() {
    // 加载备份设置
    this.loadBackupSettings();
  },

  onShow: function() {
    // 刷新页面数据
    this.loadBackupSettings();
  },

  // 加载备份设置
  loadBackupSettings: function() {
    const lastBackupTime = wx.getStorageSync('lastBackupTime') || '';
    const backupReminder = wx.getStorageSync('backupReminder');
    const reminderInterval = wx.getStorageSync('reminderInterval') || 7;

    this.setData({
      lastBackupTime: lastBackupTime,
      backupReminder: backupReminder === false ? false : true, // 默认为true
      reminderInterval: reminderInterval
    });
  },

  // 保存备份设置
  saveBackupSettings: function() {
    const { backupReminder, reminderInterval } = this.data;
    wx.setStorageSync('backupReminder', backupReminder);
    wx.setStorageSync('reminderInterval', reminderInterval);

    wx.showToast({
      title: '设置已保存',
      icon: 'success',
      duration: 1500
    });
  },

  // 导出数据
  exportData: function() {
    try {
      // 获取所有数据
      const allSchedules = wx.getStorageSync('allSchedules') || {};
      const allTags = wx.getStorageSync('allTags') || [];
      
      // 创建导出数据对象
      const exportData = {
        allSchedules: allSchedules,
        allTags: allTags,
        exportTime: new Date().toISOString(),
        version: '1.0' // 数据版本，便于后续兼容性处理
      };
      
      // 转换为JSON字符串
      const exportDataStr = JSON.stringify(exportData);
      
      // 使用微信API复制到剪贴板
      wx.setClipboardData({
        data: exportDataStr,
        success: () => {
          // 更新最后备份时间
          const now = new Date();
          const lastBackupTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          
          wx.setStorageSync('lastBackupTime', lastBackupTime);
          
          this.setData({
            lastBackupTime: lastBackupTime
          });
          
          wx.showModal({
            title: '导出成功',
            content: '数据已复制到剪贴板，请粘贴保存到安全的地方。',
            showCancel: false
          });
        },
        fail: () => {
          wx.showModal({
            title: '导出失败',
            content: '无法复制数据到剪贴板，请重试。',
            showCancel: false
          });
        }
      });
    } catch (error) {
      wx.showModal({
        title: '导出错误',
        content: '导出数据时发生错误：' + error.message,
        showCancel: false
      });
    }
  },

  // 导入数据
  importData: function() {
    wx.showModal({
      title: '导入确认',
      content: '导入数据将覆盖当前所有日程和标签数据，确定继续吗？',
      success: (res) => {
        if (res.confirm) {
          // 用户确认导入
          wx.getClipboardData({
            success: (res) => {
              try {
                // 尝试解析剪贴板中的JSON数据
                const importData = JSON.parse(res.data);
                
                // 验证数据格式
                if (!importData.allSchedules || !importData.allTags || !importData.version) {
                  throw new Error('数据格式不正确');
                }
                
                // 保存导入的数据
                wx.setStorageSync('allSchedules', importData.allSchedules);
                wx.setStorageSync('allTags', importData.allTags);
                
                // 更新最后备份时间
                const now = new Date();
                const lastBackupTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                
                wx.setStorageSync('lastBackupTime', lastBackupTime);
                
                this.setData({
                  lastBackupTime: lastBackupTime
                });
                
                wx.showModal({
                  title: '导入成功',
                  content: '数据已成功导入，请返回日历页面查看。',
                  showCancel: false
                });
              } catch (error) {
                wx.showModal({
                  title: '导入失败',
                  content: '剪贴板中的数据格式不正确或已损坏。',
                  showCancel: false
                });
              }
            },
            fail: () => {
              wx.showModal({
                title: '导入失败',
                content: '无法读取剪贴板数据，请确保已复制有效的备份数据。',
                showCancel: false
              });
            }
          });
        }
      }
    });
  },

  // 显示提醒设置弹窗
  showReminderSetting: function() {
    this.setData({
      showReminderSettingPopup: true
    });
  },

  // 隐藏提醒设置弹窗
  hideReminderSetting: function() {
    this.setData({
      showReminderSettingPopup: false
    });
  },

  // 切换备份提醒开关
  onReminderSwitchChange: function(e) {
    this.setData({
      backupReminder: e.detail.value
    });
  },

  // 选择提醒间隔
  onIntervalChange: function(e) {
    const intervalValue = parseInt(this.data.reminderIntervalOptions[e.detail.value]);
    this.setData({
      reminderInterval: intervalValue
    });
  },

  // 保存提醒设置
  saveReminderSettings: function() {
    this.saveBackupSettings();
    this.hideReminderSetting();
  },

  // 返回首页
  navigateBack: function() {
    wx.navigateBack();
  }
});