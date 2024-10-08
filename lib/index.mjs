#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import handlebars from "handlebars";
import ora from "ora";
import chalk from "chalk";
import symbols from "log-symbols";
import { sync as rm } from "rimraf";
import { simpleGit } from "simple-git";
const program = new Command();
const git = simpleGit();
program
    .command("init <name>")
    .description("创建一个项目，zgj-cli init {name}")
    .option("-g, --git", "使用git方式下载模板")
    .option("-s, --ssh", "使用ssh方式下载模板")
    .action((name, cmd) => {
    if (!fs.existsSync(name)) {
        const options = [
            {
                type: "input",
                name: "author",
                message: "请输入作者名称",
            },
            {
                type: "input",
                name: "description",
                message: "请输入项目描述",
            },
        ];
        inquirer.prompt(options).then((answers) => {
            let spinner = ora("正在下载模板...");
            spinner.start();
            let url = "https://github.com/yanyongchao/yl-vue-template.git";
            if (cmd.ssh) {
                url = "git@github.com:yanyongchao/lerna-test.git";
            }
            const handlerFn = (err) => {
                if (err) {
                    spinner.fail();
                    console.log(symbols.error, chalk.red(err));
                }
                else {
                    spinner.succeed("下载模板成功");
                    rm(name + "/.git");
                    const meta = {
                        name,
                        author: answers.author,
                        description: answers.description,
                    };
                    const fileName = `${name}/package.json`;
                    if (fs.existsSync(fileName)) {
                        const content = fs.readFileSync(fileName).toString();
                        const result = handlebars.compile(content)(meta);
                        fs.writeFileSync(fileName, result);
                    }
                    console.log(symbols.success, "项目初始化成功");
                    console.log(`------请按下列命令设置git------`);
                    console.log(`cd ${name} && git init`);
                    if (cmd.ssh) {
                        console.log(`git remote add origin {you project git address}`);
                    }
                    else {
                        console.log(`git remote add origin {you project git address}`);
                    }
                    console.log(`git add ./*`);
                    console.log(`git commit -m first commit!`);
                    console.log(`git push -u origin master`);
                }
            };
            git.clone(url, name, handlerFn);
        });
    }
    else {
        console.log(symbols.error, chalk.red("项目已存在"));
    }
});
program.parse(process.argv);
