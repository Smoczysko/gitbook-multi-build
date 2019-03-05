#!/usr/bin/env node

const path = require('path');
const program = require('commander');
const chalk = require('chalk');

const pkg = require(path.join(__dirname, '../package.json'));
const buildCommand = require('./commands/build');

program
  .version(pkg.version)
  .description(pkg.description);

program
  .command('build')
  .alias('b')
  .description('Builds GitBook books with based on provided config')
  .action(async (...args) => {
    await buildCommand(args[0]);
  });

program.on('command:*', () => {
  console.error(chalk.red('Invalid command: ', program.args.join(' ')) + '\n');
  console.error(chalk.red('See --help for a list of available commands.') + '\n');

  process.exit(1);
});

if (!process.argv.slice(2).length) {
  console.warn(chalk.yellow('No command specified!' + '\n'));

  program.outputHelp(help => chalk.yellow(help));

  process.exit(1);
}

program.parse(process.argv);

