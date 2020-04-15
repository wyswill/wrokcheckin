/// <reference path="./type.d.ts" />
const fs = require('fs'), os = require('os');
const homepath = os.homedir();
const dbPath = `${homepath}/db.json`, configPath = `${homepath}/config.json`;
const chalk = require('chalk');
const symbols = require('log-symbols');
export default class timeManleger {
  public db: STORE = {};
  public config: answrod = {lh: 9, lm: 30};

  /**
   * 保存数据到缓存中
   */
  save() {
    const writeStream = fs.createWriteStream(dbPath, {flags: 'r+'});
    writeStream.write(JSON.stringify(this.db));
    writeStream.on('drain', () => {
      console.log(symbols.error, chalk.red('内存不够用了!清除内存!'));
    })
    writeStream.end();
  }

  /**
   * 保存配置
   */
  saveConfig(answers: answrod) {
    this.config = answers;
    const writeStream = fs.createWriteStream(configPath, {flags: 'r+'},);
    writeStream.write(JSON.stringify(this.config));
    writeStream.on('drain', () => {
      console.log(symbols.error, chalk.red('内存不够用了!清除内存!'));
    })
    writeStream.end();
  }

  /**
   * 加载本地缓存
   */
  lodeData() {
    return new Promise(resolve => {
      fs.exists(dbPath, (exists: boolean) => {
        if (exists) {
          const readStream = fs.createReadStream(dbPath);
          readStream.setEncoding('UTF8');
          let data = '';
          readStream.on("data", (chunk: string) => {
            data += chunk;
          });
          readStream.on("end", () => {
            this.db = JSON.parse(data);
            resolve();
          });
        } else {
          fs.writeFile(dbPath, '', (err: Error) => {
            if (err) throw err;
          });
          this.db = {};
          resolve();
        }
      });
    })
  }

  /**
   * 加载配置
   */
  lodeConfig() {
    fs.exists(configPath, (exists: boolean) => {
      if (exists) {
        const fileReader = fs.createReadStream(configPath);
        fileReader.setEncoding('UTF8');
        let data = '';
        fileReader.on("data", (chunk: string) => data += chunk);
        fileReader.on("end", () => {
          if (data != '')
            this.config = JSON.parse(data);
        });

      } else {
        fs.writeFile(configPath, '', (err: Error) => {
          if (err) throw err;
        });
        this.config = {lh: 9, lm: 30};
      }
    });
    return this;
  }

  /**
   * 更新数据
   * @param flag
   * @param ms
   */
  updateDate(flag: string, ms: number) {
    this.db[flag] = ms;
  }
}