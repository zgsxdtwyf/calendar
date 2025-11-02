// fileStorage.js
// 文件存储工具类，用于将数据同时存储到本地缓存和用户文件目录

/**
 * 文件存储工具类
 */
const FileStorage = {
  /**
   * 获取文件系统管理器
   */
  getFileSystemManager() {
    try {
      return wx.getFileSystemManager();
    } catch (e) {
      console.error('获取文件系统管理器失败:', e);
      return null;
    }
  },

  /**
   * 获取用户文件目录路径
   */
  getUserDataPath() {
    try {
      return wx.env.USER_DATA_PATH;
    } catch (e) {
      console.error('获取用户文件目录路径失败:', e);
      return '';
    }
  },

  /**
   * 确保目录存在，如果不存在则创建
   * @param {string} dirPath 目录路径
   */
  ensureDirectoryExists(dirPath) {
    const fs = this.getFileSystemManager();
    try {
      // 尝试访问目录，如果不存在会抛出异常
      fs.accessSync(dirPath);
    } catch (e) {
      // 目录不存在，创建目录
      try {
        fs.mkdirSync(dirPath, true);
      } catch (err) {
        console.error('创建目录失败:', err);
      }
    }
  },

  /**
   * 保存数据到文件
   * @param {string} fileName 文件名
   * @param {Object} data 要保存的数据
   * @returns {boolean} 是否保存成功
   */
  saveToFile(fileName, data) {
    try {
      const fs = this.getFileSystemManager();
      if (!fs) {
        console.error('文件系统管理器不可用');
        return false;
      }
      
      const userPath = this.getUserDataPath();
      if (!userPath) {
        console.error('用户文件目录路径不可用');
        return false;
      }
      
      // 显示用户文件目录路径
      console.log('用户文件目录路径:', userPath);
      
      const filePath = `${userPath}/calendar_data`;
      
      // 确保目录存在
      this.ensureDirectoryExists(filePath);
      
      // 将数据转换为JSON字符串
      const jsonData = JSON.stringify(data);
      
      // 使用同步方式写入文件（更可靠）
      const targetPath = `${filePath}/${fileName}.json`;
      console.log(`尝试写入文件: ${targetPath}`);
      
      try {
        // 使用同步方式写入，确保写入完成
        fs.writeFileSync(targetPath, jsonData, 'utf8');
        console.log(`同步写入文件成功: ${fileName}`);
        
        // 验证文件是否存在
        try {
          fs.accessSync(targetPath);
          const stats = fs.statSync(targetPath);
          console.log(`文件确认存在: ${targetPath}, 大小: ${stats.size} 字节`);
          
          // 尝试读取文件内容验证
          const content = fs.readFileSync(targetPath, 'utf8');
          console.log(`文件内容验证: 长度 ${content.length} 字符`);
          
          return true;
        } catch (verifyErr) {
          console.error(`文件验证失败: ${targetPath}`, verifyErr);
          return false;
        }
      } catch (writeErr) {
        console.error(`同步写入文件出错: ${fileName}`, writeErr);
        
        // 尝试使用异步方式写入
        try {
          fs.writeFile({
            filePath: targetPath,
            data: jsonData,
            encoding: 'utf8',
            success: () => {
              console.log(`异步写入文件成功: ${fileName}`);
            },
            fail: (err) => {
              console.error(`异步写入文件失败: ${fileName}`, err);
            }
          });
          return true;
        } catch (asyncWriteErr) {
          console.error(`异步写入文件也失败: ${fileName}`, asyncWriteErr);
          return false;
        }
      }
    } catch (e) {
      console.error(`保存文件 ${fileName} 失败:`, e);
      return false;
    }
  },

  /**
   * 检查文件是否存在
   * @param {string} filePath 文件路径
   * @returns {boolean} 文件是否存在
   */
  fileExists(filePath) {
    try {
      const fs = this.getFileSystemManager();
      fs.accessSync(filePath);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * 从文件读取数据
   * @param {string} fileName 文件名
   * @returns {Object|null} 读取的数据，如果读取失败则返回null
   */
  readFromFile(fileName) {
    try {
      const fs = this.getFileSystemManager();
      const filePath = `${this.getUserDataPath()}/calendar_data/${fileName}.json`;
      
      // 先检查文件是否存在
      if (!this.fileExists(filePath)) {
        console.log(`文件不存在: ${filePath}`);
        return null;
      }
      
      // 读取文件内容
      const fileContent = fs.readFileSync(filePath, 'utf8');
      console.log(`成功读取文件: ${fileName}, 内容长度: ${fileContent.length}`);
      
      // 解析JSON数据
      return JSON.parse(fileContent);
    } catch (e) {
      console.error(`读取文件 ${fileName} 失败:`, e);
      return null;
    }
  },

  /**
   * 同时保存数据到本地缓存和文件
   * @param {string} key 缓存键名
   * @param {Object} data 要保存的数据
   */
  saveData(key, data) {
    // 保存到本地缓存
    try {
      wx.setStorageSync(key, data);
      console.log(`数据已保存到缓存: ${key}`);
    } catch (e) {
      console.error(`保存到缓存失败: ${key}`, e);
    }
    
    // 保存到文件
    const result = this.saveToFile(key, data);
    console.log(`数据保存到文件${result ? '成功' : '失败'}: ${key}`);
  },

  /**
   * 读取数据，优先从本地缓存读取，如果不存在则从文件读取
   * @param {string} key 缓存键名
   * @returns {Object|null} 读取的数据，如果读取失败则返回null
   */
  getData(key) {
    try {
      let data = null;
      let fromCache = false;
      
      // 尝试从本地缓存读取
      try {
        // 检查数据是否存在于缓存中
        if (wx.getStorageInfoSync().keys.includes(key)) {
          data = wx.getStorageSync(key);
          console.log(`从缓存读取数据: ${key}`, typeof data);
          fromCache = true;
        } else {
          console.log(`缓存中不存在数据: ${key}`);
        }
      } catch (cacheError) {
        console.log(`缓存读取失败: ${cacheError}`);
      }
      
      // 如果本地缓存没有或读取失败，则从文件读取
      if (!fromCache) {
        console.log(`尝试从文件读取数据: ${key}`);
        
        // 获取文件系统管理器
        const fs = this.getFileSystemManager();
        if (!fs) {
          console.error('文件系统管理器不可用');
          return data; // 返回可能为null的data
        }
        
        // 获取文件路径
        const userPath = this.getUserDataPath();
        if (!userPath) {
          console.error('用户文件目录路径不可用');
          return data; // 返回可能为null的data
        }
        
        const filePath = `${userPath}/calendar_data/${key}.json`;
        console.log(`尝试读取文件: ${filePath}`);
        
        // 检查文件是否存在
        try {
          fs.accessSync(filePath);
          console.log(`文件存在: ${filePath}`);
          
          // 读取文件内容
          try {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            console.log(`成功读取文件: ${key}, 内容长度: ${fileContent.length}`);
            
            // 解析JSON数据
            data = JSON.parse(fileContent);
            console.log(`成功解析文件数据: ${key}`, typeof data);
            
            // 如果从文件读取成功，同时更新缓存
            try {
              wx.setStorageSync(key, data);
              console.log(`已将文件数据更新到缓存: ${key}`);
            } catch (updateError) {
              console.error(`更新缓存失败: ${key}`, updateError);
            }
          } catch (readError) {
            console.error(`读取文件内容失败: ${filePath}`, readError);
          }
        } catch (accessError) {
          console.log(`文件不存在或无法访问: ${filePath}`, accessError);
        }
      }
      
      return data;
    } catch (e) {
      console.error(`获取数据 ${key} 失败:`, e);
      return null;
    }
  }
};

module.exports = FileStorage;