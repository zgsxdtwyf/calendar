// pages/index/index.js
Page({
    data: {
        // Data for calendar and schedules will be stored here
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        days: [],
        showSchedulePopup: false,
        selectedDate: '',
        schedules: [],
        showAddOptionsPopup: false,
        // Data for Create Schedule Popup
        showCreateSchedulePopup: false,
        scheduleTitle: '',
        scheduleColor: '#1E90FF', // Default color
        isAllDay: true, // Default to all-day
        startTime: '09:00', // Default start time
        endTime: '10:00', // Default end time
        colors: ['#FFC0CB', '#F5DEB3', '#ADD8E6', '#d5d755', '#3fa9f5', '#87CEEB', '#90EE90',  '#00b392', '#BDB76B', '#bb80d1',  '#DDA0DD', '#A0522D', '#ff4c00' ], // Available colors
        allSchedules: {}, // Store all schedules keyed by date (YYYY-M-D)

        // Data for Edit Schedule Popup
        showEditSchedulePopup: false,
        editingScheduleId: null,
        editingScheduleTitle: '',
        editingScheduleColor: '#1E90FF',
        editingIsAllDay: true,
        editingStartTime: '09:00',
        editingEndTime: '10:00',

        // Data for Copy/Cut/Paste/Tag features
        clipboardSchedule: null, // Stores the schedule being copied or cut
        clipboardOperation: null, // 'copy' or 'cut'
        originalDateKeyForCut: null, // Stores the original date key for cut operation
        showScheduleOptionsPopup: false, // Controls visibility of copy/cut/tag options
        showPastePopup: false, // Controls visibility of paste option
        pasteDateKey: null, // Stores the date key where paste is intended
        pastePopupTop: 0, // Position for paste popup
        pastePopupLeft: 0, // Position for paste popup
        // 新增: 标签相关数据
        allTags: [],
        showTagListPopup: false, // 控制标签列表弹窗的显示
        isSidebarShow: false, // 控制侧边栏显示/隐藏的状态
        startX: 0, // 触摸开始时的X坐标
        startY: 0, // 触摸开始时的Y坐标
        rpxRatio: 1, // 用于px到rpx的转换比例 
    },

    /**
   * 切换侧边栏的显示状态
   */
    toggleSidebar: function () {
        this.setData({
            isSidebarShow: !this.data.isSidebarShow
        });
    },

    /**
     * 跳转到标签管理页面
     */
    goToTagManagement: function () {
        // 关闭侧边栏
        this.setData({
            isSidebarShow: false
        });
        // 跳转到标签管理页面，请确保 'pages/tagManagement/tagManagement' 是您标签管理页面的正确路径
        wx.navigateTo({
            url: '/pages/tagManagement/tagManagement',
            fail: (err) => {
                console.error('跳转标签管理页面失败:', err);
                wx.showToast({
                    title: '页面不存在',
                    icon: 'none'
                });
            }
        });
    },

    onLoad: function () {
        // Page initialization logic
        // Load schedules from storage on load
        // const allSchedules = wx.getStorageSync('allSchedules') || {};
        // // 修改：默认标签现在是对象数组
        // const defaultTags = [
        //     { title: '工作', color: '#1E90FF', isAllDay: true, startTime: '09:00', endTime: '10:00' },
        //     { title: '学习', color: '#32CD32', isAllDay: true, startTime: '09:00', endTime: '10:00' },
        //     { title: '会议', color: '#FF6347', isAllDay: false, startTime: '14:00', endTime: '15:00' },
        //     { title: '健身', color: '#8A2BE2', isAllDay: true, startTime: '09:00', endTime: '10:00' },
        //     { title: '购物', color: '#FFD700', isAllDay: true, startTime: '09:00', endTime: '10:00' },
        //     { title: '生日', color: '#FF69B4', isAllDay: true, startTime: '09:00', endTime: '10:00' }
        // ];
        // const allTags = wx.getStorageSync('allTags') || defaultTags; // 加载已保存的标签，如果为空则提供默认标签
        // this.setData({
        //     allSchedules: allSchedules,
        //     allTags: allTags // 新增：加载标签数据
        // });
        // this.renderCalendar(this.data.year, this.data.month);
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        this.setData({
            year: year,
            month: month,
            selectedDate: '', // Initialize selectedDate
            schedules: [], // Initialize schedules
            allSchedules: wx.getStorageSync('allSchedules') || {},
            allTags: wx.getStorageSync('allTags') || [], // Load allTags on load
            colors: ['#FFC0CB', '#F5DEB3', '#ADD8E6', '#d5d755', '#3fa9f5', '#87CEEB', '#90EE90',  '#00b392', '#BDB76B', '#bb80d1',  '#DDA0DD', '#A0522D', '#ff4c00' ],
        });
        this.renderCalendar(year, month);
         // 新增：获取系统信息，计算rpx与px的转换比例
         wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    rpxRatio: 750 / res.windowWidth
                });
            }
        });
    },

    onShow: function () {
        // 页面显示时重新加载所有标签数据
        const allTags = wx.getStorageSync('allTags') || [];
        this.setData({
            allTags: allTags
        });
    },
    // Event handlers for date clicks and button clicks will be added here
    onDayClick: function (event) {
        const { date, month, year } = event.currentTarget.dataset;
        if (date) {
            const selectedDate = `${year}年${month}月${date}日`;
            // In a real application, you would fetch schedules for this date
            // For now, we'll use dummy data or check local storage
            const schedules = this.getSchedulesForDate(selectedDate);
            this.setData({
                showSchedulePopup: true,
                selectedDate: selectedDate,
                schedules: schedules
            });
        }
    },

    hideSchedulePopup: function () {
        this.setData({
            showSchedulePopup: false,
            selectedDate: '',
            schedules: []
        });
    },

    onAddScheduleClick: function () {
        this.setData({
            showSchedulePopup: false,
            showAddOptionsPopup: true
        });
    },

    hideAddOptionsPopup: function () {
        this.setData({
            showAddOptionsPopup: false
        });
    },
    // 新增：隐藏新建日程弹窗
    hideCreateSchedulePopup: function () {
        this.setData({
            showCreateSchedulePopup: false
        });
    },
    onAddSchedule: function () {
        console.log('添加日程');
        // Show the create schedule popup
        this.setData({
            showAddOptionsPopup: false,
            showCreateSchedulePopup: true,
            // Reset form fields
            scheduleTitle: '',
            scheduleColor: this.data.colors[0] || '#1E90FF', // Reset to default color
            isAllDay: true,
            startTime: '09:00',
            endTime: '10:00',
        });
        console.log('showCreateSchedulePopup 的值:', this.data.showCreateSchedulePopup); // 添加这行日志
    },

    onAddTag: function () {
        console.log('添加标签');
        this.hideAddOptionsPopup(); // 隐藏初始的添加选项弹窗

        if (this.data.allTags.length === 0) {
            wx.showToast({
                title: '无可使用标签',
                icon: 'none',
                duration: 1000
            });
        } else {
            this.setData({
                showTagListPopup: true // 显示标签列表弹窗
            });
        }
    },

    // 隐藏标签列表弹窗
    hideTagListPopup: function () {
        this.setData({
            showTagListPopup: false
        });
    },

    // 处理从标签列表中选择一个标签
    onTagSelect: function (event) {
        const selectedTag = event.currentTarget.dataset.tag;
        const { selectedDate, allSchedules } = this.data;

        if (!selectedDate) {
            wx.showToast({ title: '请先选择日期', icon: 'none' });
            this.hideTagListPopup();
            return;
        }

        // 格式化 selectedDate 为 YYYY-M-D 作为存储键
        const dateParts = selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
        if (!dateParts) {
            console.error("Invalid selectedDate format for adding tag as schedule.");
            wx.showToast({ title: '添加失败', icon: 'none' });
            this.hideTagListPopup();
            return;
        }
        const dateKey = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`;

        // 从选中的标签创建一个新日程
        const newSchedule = {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // 唯一 ID
            title: selectedTag.title,
            color: selectedTag.color,
            isAllDay: selectedTag.isAllDay,
            startTime: selectedTag.startTime,
            endTime: selectedTag.endTime,
        };

        let updatedAllSchedules = { ...allSchedules };
        if (!updatedAllSchedules[dateKey]) {
            updatedAllSchedules[dateKey] = [];
        }
        updatedAllSchedules[dateKey].push(newSchedule);

        // 如果不是全天日程，则按时间排序（可选但良好实践）
        updatedAllSchedules[dateKey].sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return 0;
            // 如果都不是全天日程，则比较时间
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

        // 保存到存储
        wx.setStorageSync('allSchedules', updatedAllSchedules);

        // 更新数据并重新渲染日历
        this.setData({
            allSchedules: updatedAllSchedules,
            showTagListPopup: false, // 隐藏标签列表弹窗
            showSchedulePopup: false, // 修改：隐藏日程列表弹窗
            selectedDate: '', // 新增：清空选中的日期
            schedules: [] // 新增：清空日程列表
        });

        // 重新渲染日历以显示新日程
        this.renderCalendar(this.data.year, this.data.month);

        wx.showToast({
            title: '标签已添加为日程',
            icon: 'success',
            duration: 1000
        });
    },

    // Hide paste popup
    hidePastePopup: function () {
        this.setData({
            showPastePopup: false,
            pasteDateKey: null,
        });
    },

    // Handle Paste action
    onPasteSchedule: function () {
        const { clipboardSchedule, clipboardOperation, originalDateKeyForCut, pasteDateKey, allSchedules, selectedDate } = this.data;

        if (!clipboardSchedule || !pasteDateKey) {
            console.error("Paste failed: clipboard empty or no target date.");
            wx.showToast({ title: '粘贴失败', icon: 'none' });
            this.hidePastePopup();
            return;
        }

        let updatedAllSchedules = { ...allSchedules };
        const scheduleToPaste = { ...clipboardSchedule }; // Create a copy

        // If it's a cut operation, remove from original date
        if (clipboardOperation === 'cut' && originalDateKeyForCut) {
            if (updatedAllSchedules[originalDateKeyForCut]) {
                updatedAllSchedules[originalDateKeyForCut] = updatedAllSchedules[originalDateKeyForCut].filter(s => s.id !== scheduleToPaste.id);
                // If the original date is the currently selected date, update the list
                const selectedDateKey = selectedDate.match(/(\d+)年(\d+)月(\d+)日/).slice(1).join('-');
                if (originalDateKeyForCut === selectedDateKey) {
                    this.setData({
                        schedules: updatedAllSchedules[originalDateKeyForCut] || []
                    });
                }
            }
        }

        // If it's a copy operation, generate a new ID
        if (clipboardOperation === 'copy') {
            scheduleToPaste.id = Date.now() + Math.random().toString(36).substr(2, 9);
        }
        // Note: If it's a cut operation, keep the original ID

        // Add to the target date
        if (!updatedAllSchedules[pasteDateKey]) {
            updatedAllSchedules[pasteDateKey] = [];
        }
        updatedAllSchedules[pasteDateKey].push(scheduleToPaste);

        // Sort schedules by time if not all-day (optional but good practice)
        updatedAllSchedules[pasteDateKey].sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return 0;
            // Compare times if both are not all-day
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });


        // Save to storage
        wx.setStorageSync('allSchedules', updatedAllSchedules);

        // Update data
        this.setData({
            allSchedules: updatedAllSchedules,
            clipboardSchedule: null, // Clear clipboard
            clipboardOperation: null,
            originalDateKeyForCut: null,
            showPastePopup: false, // Hide paste popup
            pasteDateKey: null,
        });

        // Re-render the calendar to show the updated schedules
        this.renderCalendar(this.data.year, this.data.month);

        // If the target date is the currently selected date, update the schedule list popup
        const selectedDateKey = selectedDate.match(/(\d+)年(\d+)月(\d+)日/).slice(1).join('-');
        if (pasteDateKey === selectedDateKey) {
            this.setData({
                schedules: updatedAllSchedules[pasteDateKey] || []
            });
        }


        // Show success message
        wx.showToast({
            title: '粘贴成功',
            icon: 'success',
            duration: 1000
        });
    },


    // Handle title input
    onTitleInput: function (e) {
        this.setData({
            scheduleTitle: e.detail.value
        });
    },

    // Handle color selection
    onColorSelect: function (e) {
        this.setData({
            scheduleColor: e.currentTarget.dataset.color
        });
    },

    // Handle all-day switch change
    onAllDayChange: function (e) {
        this.setData({
            isAllDay: e.detail.value
        });
    },

    // Handle start time picker change
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
            startTime: newStartTime,
            endTime: newEndTime // 自动更新结束时间
        });
    },

    // Handle end time picker change
    onEndTimeChange: function (e) {
        this.setData({
            endTime: e.detail.value
        });
    },

    // Handle editing title input
    onEditingTitleInput: function (e) {
        this.setData({
            editingScheduleTitle: e.detail.value
        });
    },

    // Handle editing color selection
    onEditingColorSelect: function (e) {
        this.setData({
            editingScheduleColor: e.currentTarget.dataset.color
        });
    },

    // Handle editing all-day switch change
    onEditingAllDayChange: function (e) {
        this.setData({
            editingIsAllDay: e.detail.value
        });
    },

    // Handle editing start time picker change
    onEditingStartTimeChange: function (e) {
        const newEditingStartTime = e.detail.value;
        // 解析开始时间
        const [startHour, startMinute] = newEditingStartTime.split(':').map(Number);

        // 计算结束时间：开始时间后1小时
        let endHour = startHour + 1;
        if (endHour >= 24) {
            endHour = endHour - 24; // 跨越到第二天
        }
        const endMinute = startMinute;

        // 格式化结束时间为 HH:MM 字符串
        const newEditingEndTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        this.setData({
            editingStartTime: newEditingStartTime,
            editingEndTime: newEditingEndTime // 自动更新编辑结束时间
        });
    },

    // Handle editing end time picker change
    onEditingEndTimeChange: function (e) {
        this.setData({
            editingEndTime: e.detail.value
        });
    },

    // Save schedule
    saveSchedule: function () {
        const { selectedDate, scheduleTitle, scheduleColor, isAllDay, startTime, endTime, allSchedules } = this.data;

        if (!scheduleTitle) {
            wx.showToast({
                title: '请输入标题',
                icon: 'none'
            });
            return;
        }

        // Format selectedDate to YYYY-M-D for storage key
        const dateParts = selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
        const dateKey = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`;

        // Create a unique ID for the schedule
        const newSchedule = {
            id: Date.now() + Math.random().toString(36).substr(2, 9), // Simple unique ID
            title: scheduleTitle,
            color: scheduleColor,
            isAllDay: isAllDay,
            startTime: startTime,
            endTime: endTime,
            // Add a unique ID for potential future use (e.g., editing/deleting)
            id: Date.now() + Math.random().toString(36).substr(2, 9)
        };

        // Add new schedule to allSchedules
        if (!allSchedules[dateKey]) {
            allSchedules[dateKey] = [];
        }
        allSchedules[dateKey].push(newSchedule);

        // Sort schedules by time if not all-day (optional but good practice)
        allSchedules[dateKey].sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return 0;
            // Compare times if both are not all-day
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });


        // Save to storage
        wx.setStorageSync('allSchedules', allSchedules);


        // Update data and re-render calendar or update specific day
        this.setData({
            allSchedules: allSchedules,
            showCreateSchedulePopup: false,
            scheduleTitle: '', // Clear form
            scheduleColor: this.data.colors[0] || '#1E90FF',
            isAllDay: true,
            startTime: '09:00',
            endTime: '10:00',
        });

        // Re-render the calendar to show the new schedule
        this.renderCalendar(this.data.year, this.data.month);

        // Show success message
        wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 1000
        });
    },

     // 新增：触摸开始事件
     onTouchStart: function (e) {
        this.setData({
            startX: e.touches[0].clientX,
            startY: e.touches[0].clientY
        });
    },

    // 新增：触摸结束事件
    onTouchEnd: function (e) {
        const { startX, startY, rpxRatio } = this.data;
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const deltaX_px = endX - startX;
        const deltaY_px = endY - startY;

        // 将像素差转换为rpx差，用于阈值比较
        const deltaX_rpx = deltaX_px * rpxRatio;
        const deltaY_rpx = deltaY_px * rpxRatio;

        const minSwipeDistance = 50; // rpx, 最小滑动距离

        // 判断是水平滑动且滑动距离足够
        if (Math.abs(deltaX_rpx) > Math.abs(deltaY_rpx) && Math.abs(deltaX_rpx) > minSwipeDistance) {
            if (deltaX_rpx > 0) { // 右滑
                this.previousMonth();
            } else { // 左滑
                this.nextMonth();
            }
        }
    },
    // Handle editing title input
    onEditingTitleInput: function (e) {
        this.setData({
            editingScheduleTitle: e.detail.value
        });
    },

    // Handle editing color selection
    onEditingColorSelect: function (e) {
        this.setData({
            editingScheduleColor: e.currentTarget.dataset.color
        });
    },

    // Handle editing all-day switch
    onEditingAllDayChange: function (e) {
        this.setData({
            editingIsAllDay: e.detail.value
        });
    },

    // Handle editing start time change
    onEditingStartTimeChange: function (e) {
        this.setData({
            editingStartTime: e.detail.value
        });
    },

    // Handle editing end time change
    onEditingEndTimeChange: function (e) {
        this.setData({
            editingEndTime: e.detail.value
        });
    },

    // Save edited schedule
    saveEditedSchedule: function () {
        const { selectedDate, editingScheduleId, editingScheduleTitle, editingScheduleColor, editingIsAllDay, editingStartTime, editingEndTime, allSchedules } = this.data;

        if (!editingScheduleTitle) {
            wx.showToast({
                title: '请输入标题',
                icon: 'none'
            });
            return;
        }
        // Format selectedDate to YYYY-M-D for storage key
        const dateParts = selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
        const dateKey = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`;

        // Find the schedule to edit
        const daySchedules = allSchedules[dateKey] || [];
        const scheduleIndex = daySchedules.findIndex(s => s.id === editingScheduleId);

        if (scheduleIndex === -1) {
            console.error("Schedule not found for editing!");
            wx.showToast({
                title: '保存失败',
                icon: 'none'
            });
            return;
        }

        // Update the schedule
        daySchedules[scheduleIndex] = {
            ...daySchedules[scheduleIndex], // Keep existing properties like ID
            title: editingScheduleTitle,
            color: editingScheduleColor,
            isAllDay: editingIsAllDay,
            startTime: editingStartTime,
            endTime: editingEndTime,
        };

        // Sort schedules by time if not all-day (optional but good practice)
        daySchedules.sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return 0;
            // Compare times if both are not all-day
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

        // Update allSchedules and save to storage
        allSchedules[dateKey] = daySchedules;
        wx.setStorageSync('allSchedules', allSchedules);

        // Update data and re-render calendar and schedule list
        this.setData({
            allSchedules: allSchedules,
            showEditSchedulePopup: false, // Hide edit popup
            showSchedulePopup: true, // Show schedule list popup again
            schedules: daySchedules, // Update the list in the schedule list popup
            // Clear editing fields (optional)
            editingScheduleId: null,
            editingScheduleTitle: '',
            editingScheduleColor: this.data.colors[0] || '#1E90FF',
            editingIsAllDay: true,
            editingStartTime: '09:00',
            editingEndTime: '10:00',
        });

        // Re-render the calendar to show the updated schedule in the day view
        this.renderCalendar(this.data.year, this.data.month);

        // Show success message
        wx.showToast({
            title: '保存成功',
            icon: 'success',
            duration: 1000
        });
    },
    // Handle click on a schedule item in the list
    onScheduleItemClick: function (event) {
        const schedule = event.currentTarget.dataset.schedule;
        console.log('点击了日程项:', schedule);
        this.setData({
            showSchedulePopup: false, // Hide schedule list popup
            showEditSchedulePopup: true, // Show edit schedule popup
            editingScheduleId: schedule.id,
            editingScheduleTitle: schedule.title,
            editingScheduleColor: schedule.color,
            editingIsAllDay: schedule.isAllDay,
            editingStartTime: schedule.startTime,
            editingEndTime: schedule.endTime,
        });
    },

    // Hide edit schedule popup
    hideEditSchedulePopup: function () {
        this.setData({
            showEditSchedulePopup: false,
            showSchedulePopup: true // Return to schedule list popup
        });
    },

    // Handle click on delete button in edit popup
    onDeleteScheduleClick: function () {
        wx.showModal({
            title: '确认删除',
            content: '确定要删除此日程吗？',
            success: (res) => {
                if (res.confirm) {
                    this.deleteSchedule();
                }
            }
        });
    },

    // Delete schedule
    // deleteSchedule: function () {
    //     const { selectedDate, editingScheduleId, allSchedules } = this.data;

    //     const dateParts = selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
    //     const dateKey = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`;

    //     let daySchedules = allSchedules[dateKey] || [];
    //     const updatedSchedules = daySchedules.filter(s => s.id !== editingScheduleId);

    //     allSchedules[dateKey] = updatedSchedules;

    //     wx.setStorageSync('allSchedules', allSchedules);

    //     this.setData({
    //         allSchedules: allSchedules,
    //         showEditSchedulePopup: false,
    //         showSchedulePopup: true,
    //         schedules: updatedSchedules,
    //     });

    //     this.renderCalendar(this.data.year, this.data.month);

    //     wx.showToast({
    //         title: '删除成功',
    //         icon: 'success',
    //         duration: 1500
    //     });
    // },
    // Delete schedule
    deleteSchedule: function () {
        const { selectedDate, editingScheduleId, allSchedules } = this.data;

        // Format selectedDate to YYYY-M-D for storage key
        const dateParts = selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
        if (!dateParts) {
            console.error("Invalid selectedDate format for deletion.");
            wx.showToast({ title: '删除失败', icon: 'none' });
            return;
        }
        const dateKey = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`;

        let daySchedules = allSchedules[dateKey] || [];

        // Filter out the schedule to be deleted
        const updatedDaySchedules = daySchedules.filter(s => s.id !== editingScheduleId);

        // Update allSchedules and save to storage
        allSchedules[dateKey] = updatedDaySchedules;
        wx.setStorageSync('allSchedules', allSchedules);

        // Update data and re-render calendar and schedule list
        this.setData({
            allSchedules: allSchedules,
            showEditSchedulePopup: false, // Hide edit popup
            showSchedulePopup: true, // Show schedule list popup again
            schedules: updatedDaySchedules, // Update the list in the schedule list popup
            // Clear editing fields
            editingScheduleId: null,
            editingScheduleTitle: '',
            editingScheduleColor: this.data.colors[0] || '#1E90FF',
            editingIsAllDay: true,
            editingStartTime: '09:00',
            editingEndTime: '10:00',
        });

        // Re-render the calendar to show the updated schedule in the day view
        this.renderCalendar(this.data.year, this.data.month);

        // Show success message
        wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1000
        });
    },
    // Handle long press on a schedule item in the list
    onScheduleItemLongPress: function (event) {
        const schedule = event.currentTarget.dataset.schedule;
        console.log('长按了日程项:', schedule);
        this.setData({
            clipboardSchedule: schedule,
            clipboardOperation: null, // Reset operation
            originalDateKeyForCut: this.data.selectedDate.match(/(\d+)年(\d+)月(\d+)日/).slice(1).join('-'), // Store original date key for cut
            showScheduleOptionsPopup: true, // Show options popup
        });
    },

    // Hide schedule options popup
    hideScheduleOptionsPopup: function () {
        this.setData({
            showScheduleOptionsPopup: false
        });
    },

    // Handle copy schedule
    onCopySchedule: function () {
        this.setData({
            clipboardOperation: 'copy',
            showScheduleOptionsPopup: false,
            showSchedulePopup: false, // 新增：关闭日程列表弹窗
            selectedDate: '', // 新增：清空选中的日期
            schedules: [] // 新增：清空日程列表
        });
        wx.showToast({
            title: '已复制',
            icon: 'success',
            duration: 1000
        });
    },

    // Handle cut schedule
    onCutSchedule: function () {
        this.setData({
            clipboardOperation: 'cut',
            showScheduleOptionsPopup: false,
            showSchedulePopup: false, // 新增：关闭日程列表弹窗
            selectedDate: '', // 新增：清空选中的日期
            schedules: [] // 新增：清空日程列表
        });
        wx.showToast({
            title: '已剪切',
            icon: 'success',
            duration: 1000
        });
    },

    // Handle save as tag
    onSaveAsTag: function () {
        const { clipboardSchedule } = this.data;
        if (clipboardSchedule) {
            let allTags = wx.getStorageSync('allTags') || [];
            // 创建新的标签对象，包含所有相关信息
            const newTag = {
                title: clipboardSchedule.title,
                color: clipboardSchedule.color,
                isAllDay: clipboardSchedule.isAllDay,
                startTime: clipboardSchedule.startTime,
                endTime: clipboardSchedule.endTime,
            };
            // 修改：查找是否已存在完全相同的标签（标题、颜色、全天、开始时间、结束时间都相同）
            const existingTagIndex = allTags.findIndex(tag =>
                tag.title === newTag.title &&
                tag.color === newTag.color &&
                tag.isAllDay === newTag.isAllDay &&
                tag.startTime === newTag.startTime &&
                tag.endTime === newTag.endTime
            );

            if (existingTagIndex === -1) { // 如果标签不存在，则添加
                allTags.push(newTag);
                wx.setStorageSync('allTags', allTags);
                wx.showToast({
                    title: '已保存为标签',
                    icon: 'success',
                    duration: 1000
                });
                this.setData({
                    allTags: allTags // 更新data中的allTags
                });
            } else { // 如果标签已存在，则提示
                wx.showToast({
                    title: '标签已存在',
                    icon: 'none',
                    duration: 1000
                });
            }
        }
        this.setData({
            showScheduleOptionsPopup: false,
            clipboardSchedule: null, // Clear clipboard after saving as tag
            clipboardOperation: null,
            showSchedulePopup: false, // 关闭日程列表弹窗
            selectedDate: '', // 清空选中的日期
            schedules: [] // 清空日程列表
        });
    },

    // Handle long press on a day to show paste option
    onDayLongPress: function (event) {
        const { date, month, year } = event.currentTarget.dataset;
        const dateKey = `${year}-${month}-${date}`;
        const { clipboardSchedule, clipboardOperation, rpxRatio } = this.data; // 获取 rpxRatio

        if (clipboardSchedule && clipboardOperation) {
            // 获取长按日期元素的尺寸和位置
            wx.createSelectorQuery().in(this).select(`#day-${year}-${month}-${date}`).boundingClientRect(rect => {
                if (rect) {
                    const systemInfo = wx.getSystemInfoSync();
                    const windowWidthPx = systemInfo.windowWidth;
                    const windowHeightPx = systemInfo.windowHeight;

                    const pastePopupWidthRpx = 150; // 从 index.wxss 获取的弹窗宽度
                    // 估算弹窗高度，根据 .paste-option 的 padding 和 font-size 估算
                    // .paste-option: padding: 15rpx; font-size: 28rpx;
                    // 估算高度约为 15 + 28 + 15 = 58rpx，加上边框等，取 60rpx
                    const pastePopupHeightRpx = 60; 

                    // 将 rpx 单位转换为 px 单位
                    const pastePopupWidthPx = pastePopupWidthRpx / rpxRatio;
                    const pastePopupHeightPx = pastePopupHeightRpx / rpxRatio;

                    // 初始计算弹窗位置：水平居中于日期格子，垂直顶部位于日期格子中心
                    let calculatedLeft = rect.left + rect.width / 2 - (pastePopupWidthPx / 2);
                    let calculatedTop = rect.top + rect.height / 2;

                    // 边界检查和调整：确保弹窗不会超出屏幕右侧
                    if (calculatedLeft + pastePopupWidthPx > windowWidthPx) {
                        calculatedLeft = windowWidthPx - pastePopupWidthPx - 10; // 距离右边缘 10px
                    }
                    // 边界检查和调整：确保弹窗不会超出屏幕左侧
                    if (calculatedLeft < 10) {
                        calculatedLeft = 10; // 距离左边缘 10px
                    }

                    // 边界检查和调整：确保弹窗不会超出屏幕底部
                    if (calculatedTop + pastePopupHeightPx > windowHeightPx) {
                        calculatedTop = windowHeightPx - pastePopupHeightPx - 10; // 距离底边缘 10px
                    }
                    // 边界检查和调整：确保弹窗不会超出屏幕顶部
                    if (calculatedTop < 10) {
                        calculatedTop = 10; // 距离顶边缘 10px
                    }

                    this.setData({
                        showPastePopup: true,
                        pasteDateKey: dateKey,
                        pastePopupTop: calculatedTop,
                        pastePopupLeft: calculatedLeft,
                    });
                }
            }).exec();
        }
    },

    // Hide paste popup
    hidePastePopup: function () {
        this.setData({
            showPastePopup: false,
            pasteDateKey: null,
        });
    },

    // Handle paste schedule
    onPasteSchedule: function () {
        const { clipboardSchedule, clipboardOperation, pasteDateKey, allSchedules, originalDateKeyForCut } = this.data;

        if (!clipboardSchedule || !pasteDateKey) {
            wx.showToast({
                title: '无内容可粘贴',
                icon: 'none'
            });
            this.hidePastePopup();
            return;
        }

        let newSchedule = { ...clipboardSchedule };
        // Generate a new ID for the pasted schedule to avoid ID conflicts
        newSchedule.id = Date.now() + Math.random().toString(36).substr(2, 9);

        // Add to target date
        if (!allSchedules[pasteDateKey]) {
            allSchedules[pasteDateKey] = [];
        }
        allSchedules[pasteDateKey].push(newSchedule);

        // Sort schedules by time
        allSchedules[pasteDateKey].sort((a, b) => {
            if (a.isAllDay && !b.isAllDay) return -1;
            if (!a.isAllDay && b.isAllDay) return 1;
            if (a.isAllDay && b.isAllDay) return 0;
            const timeA = a.startTime.split(':').map(Number);
            const timeB = b.startTime.split(':').map(Number);
            if (timeA[0] !== timeB[0]) return timeA[0] - timeB[0];
            return timeA[1] - timeB[1];
        });

        // If it was a cut operation, remove from original date
        if (clipboardOperation === 'cut' && originalDateKeyForCut) {
            let originalDaySchedules = allSchedules[originalDateKeyForCut] || [];
            allSchedules[originalDateKeyForCut] = originalDaySchedules.filter(s => s.id !== clipboardSchedule.id);
            // If original day becomes empty, clean up the key
            if (allSchedules[originalDateKeyForCut].length === 0) {
                delete allSchedules[originalDateKeyForCut];
            }
        }

        wx.setStorageSync('allSchedules', allSchedules);

        this.setData({
            allSchedules: allSchedules,
            clipboardSchedule: null,
            clipboardOperation: null,
            originalDateKeyForCut: null,
            showPastePopup: false,
            pasteDateKey: null,
        });

        // Re-render calendar and update schedule list if the current selected date is affected
        this.renderCalendar(this.data.year, this.data.month);
        // 检查 this.data.selectedDate 是否有效，避免对 null 调用 slice
        const selectedDateParts = this.data.selectedDate.match(/(\d+)年(\d+)月(\d+)日/);
        let currentSelectedDateKey = null;
        if (selectedDateParts) {
            currentSelectedDateKey = `${selectedDateParts[1]}-${selectedDateParts[2]}-${selectedDateParts[3]}`;
        }

        if (currentSelectedDateKey && (currentSelectedDateKey === pasteDateKey || currentSelectedDateKey === originalDateKeyForCut)) {
            this.setData({
                schedules: allSchedules[currentSelectedDateKey] || []
            });
        }

        wx.showToast({
            title: '粘贴成功',
            icon: 'success',
            duration: 1000
        });
    },


    // Empty function to prevent event bubbling
    noop: function () { },
    getSchedulesForDate: function (date) {
        console.log(`Fetching schedules for ${date}`);
        // Format date to YYYY-M-D for lookup
        const dateParts = date.match(/(\d+)年(\d+)月(\d+)日/);
        if (!dateParts) return []; // Invalid date format

        const dateKey = `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`;
        return this.data.allSchedules[dateKey] || [];
    },

    // Calendar navigation
    previousMonth: function () {
        let newMonth = this.data.month - 1;
        let newYear = this.data.year;
        if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }
        this.setData({
            year: newYear,
            month: newMonth
        });
        this.renderCalendar(newYear, newMonth);
    },

    nextMonth: function () {
        let newMonth = this.data.month + 1;
        let newYear = this.data.year;
        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        }
        this.setData({
            year: newYear,
            month: newMonth
        });
        this.renderCalendar(newYear, newMonth);
    },

    renderCalendar: function (year, month) {
        const days = [];
        const today = new Date(); // 获取当前日期
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth() + 1;
        const currentDate = today.getDate();
        // 转换周起始日为周一（0=周一，6=周日）
        const firstDay = new Date(year, month - 1, 1);
        const startDay = (firstDay.getDay() + 6) % 7; // 转换周日历

        // 上月填充逻辑（当首日不是周一时）
        if (startDay > 0) {
            const prevMonthLastDate = new Date(year, month - 1, 0).getDate();
            for (let i = prevMonthLastDate - startDay + 1; i <= prevMonthLastDate; i++) {
                const prevYear = month === 1 ? year - 1 : year;
                const prevMonth = month === 1 ? 12 : month - 1;
                days.push({
                    date: i,
                    year: prevYear,
                    month: prevMonth,
                    isCurrentMonth: false,
                    schedules: this.data.allSchedules[`${prevYear}-${prevMonth}-${i}`] || [],
                    isToday: false // 非当前月日期，isToday 为 false
                });
            }
        }

        // 当前月日期
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let i = 1; i <= daysInMonth; i++) {
            // 判断是否是今天
            const isToday = (year === currentYear && month === currentMonth && i === currentDate);
            days.push({
                date: i,
                year: year,
                month: month,
                isCurrentMonth: true,
                schedules: this.data.allSchedules[`${year}-${month}-${i}`] || [],
                isToday: isToday // 设置 isToday 属性
            });
        }

        // 下月填充（保持42天网格）
        const remainingCells = 42 - days.length;
        if (remainingCells > 0) {
            const nextMonthYear = month === 12 ? year + 1 : year;
            const nextMonth = month === 12 ? 1 : month + 1;

            for (let i = 1; i <= remainingCells; i++) {
                days.push({
                    date: i,
                    year: nextMonthYear,
                    month: nextMonth,
                    isCurrentMonth: false,
                    schedules: this.data.allSchedules[`${nextMonthYear}-${nextMonth}-${i}`] || [],
                    isToday: false // 非当前月日期，isToday 为 false
                });
            }
        }

        this.setData({ days: days });
    }
})