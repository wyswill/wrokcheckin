#!/usr/bin/env node
import program from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import symbols from "log-symbols";
import timeManleger from "./timeManleger";

let H: number = 0,
  M: number = 0,
  LH: number = 0,
  LM: number = 0;
const tm = new timeManleger();

program
  .version(require("../package").version, "-v,    --version", "查看工具版本")
  .option("-H,    --hour  [number]", "上班的小时")
  .option("-M,    --mine  [number]", "上班的分钟")
  .option("-LH,   --leaveHoure  [number]", "规定上班的小时")
  .option("-LM,   --leaveMine  [number]", "规定上班的分钟")
  .option("-c,    --config", "设置上班的小时和分钟")
  .action(() => {
    if (program.config) {
      inquirer
        .prompt([
          {
            message: "输入规定的上班的小时数",
            name: "lh",
            type: "input",
            validate: function (val: number): boolean | string {
              const rg = /\d{1,2}/g;
              if (rg.test(`${val}`)) {
                if (val > 24) return "必须输入有效的时间数";
                else return true;
              }
              return "必须输入有效的时间数";
            },
          },
          {
            type: "input",
            message: "输入规定的上班分钟数",
            name: "lm",
            validate(val: number): boolean | string {
              const rg = /\d{1,2}/g;
              if (rg.test(`${val}`)) {
                if (val > 60) return "必须输入有效的时间数";
                else return true;
              }
              return "必须输入有效的时间数";
            },
          },
        ])
        // @ts-ignore
        .then((answers: answrod) => {
          //写入缓存
          tm.saveConfig(answers);
          console.log(symbols.success, chalk.green("配置修改成功!"));
        });
    } else {
      tm.lodeConfig()
        .lodeData()
        .then(() => {
          const time_arg = program.args[0];
          let t = new Date();
          if (time_arg) {
            const reg = /(\d{1,2}):(\d{1,2})/gi;
            if (reg.test(time_arg)) {
              t.setHours(
                Number(time_arg.split(":")[0]),
                Number(time_arg.split(":")[1]),
              );
            }
          }
          H = program.hour || t.getHours();
          M = program.mine || t.getMinutes();
          LH = program.leaveHoure || tm.config.lh;
          LM = program.leaveMine || tm.config.lm;
          let workTime: Date;
          if (tm.db[dateToFlag(t)] && !time_arg)
            workTime = new Date(tm.db[dateToFlag(t)]);
          else
            workTime =
              program.hour && program.mine ? new Date(t.setHours(H, M)) : t;
          const leaveTime: Date = new Date(
            workTime.getTime() + pressMs(LH, LM),
          );
          console.log(
            symbols.success,
            chalk.blue("打卡时间:" + dateToFlag(workTime, true)),
          );
          console.log(
            symbols.warning,
            chalk.red("下班时间:" + dateToFlag(leaveTime, true)),
          );
          console.log(
            symbols.info,
            chalk.yellow("当前时间:" + dateToFlag(new Date(), true)),
          );
          console.log(
            symbols.info,
            chalk.yellow("剩余时间:" + timeformat(leaveTime)),
          );
          if (!tm.db[dateToFlag(workTime)] && !time_arg) {
            tm.updateDate(dateToFlag(workTime), workTime.getTime());
            tm.save();
          }
        });
    }
  });
program.parse(process.argv);

/**
 * 将输入的小时和分钟转换为对应的毫秒
 * @param h
 * @param m
 */
function pressMs(h: number = 0, m: number = 0): number {
  let totalMs = 0;
  totalMs += h * 60 * 60 * 1000;
  totalMs += m * 60 * 1000;
  return totalMs;
}

/**
 * 将date对象转换为flag字符串
 * @param date
 * @param showMore
 * @returns y/m/d-h-m
 */
function dateToFlag(date: Date, showMore: boolean = false): string {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}${
    showMore
      ? `-${date.getHours()}:${
          date.getMinutes() == 0 ? "00" : date.getMinutes()
        }`
      : ""
  }`;
}

function timeformat(date: Date) {
  if (Date.now() > date.getTime()) return "已经超时!";
  const shijiancha = date.getTime() - Date.now();
  var days = shijiancha / 1000 / 60 / 60 / 24;
  var daysRound = Math.floor(days);
  var hours = shijiancha / 1000 / 60 / 60 - 24 * daysRound;
  var hoursRound = Math.floor(hours);
  var minutes = shijiancha / 1000 / 60 - 24 * 60 * daysRound - 60 * hoursRound;
  var minutesRound = Math.floor(minutes);
  return `${hoursRound}时${minutesRound}分`;
}
