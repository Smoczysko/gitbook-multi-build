'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const chalk = require('chalk');
const nodeUtil = require('util');
const { exec } = require('child_process');
const ncp = require('ncp').ncp;
const AsyncUtils = require('../utils/async');

const execAsync = nodeUtil.promisify(exec);

const readConfiguration = (configFile) => {
  let config = null;

  console.log(chalk.yellow('Reading configuration file...'));

  try {
    config = require(path.join(process.cwd(), configFile));
  } catch (error) {
    throw new Error('Error while reading configuration file - file not found or not a proper JSON file!');
  }

  if (!config.books || !Array.isArray(config.books) || !config.books.every(book => book.hasOwnProperty('source') &&
      book.hasOwnProperty('destination'))) {
    throw new Error('Configuration error - books property incorrect!');
  }

  if (!config.output) {
    throw new Error('Configuration error - output property not configured!');
  }

  return {
    books: config.books,
    outputDirectory: path.join(process.cwd(), config.output)
  };
};

const clearWorkingDirectory = directory => {
  console.log(chalk.yellow('Preparing working directory...'));

  if (fs.existsSync(directory)) {
    rimraf.sync(directory);
  }

  fs.mkdirSync(directory);
};

const getBookFullPath = directory => `${path.join(process.cwd(), directory)}`;

const getGitBookCliDirectory = () => path.join(__dirname, '../../../gitbook-cli/bin/gitbook');

const installBookPlugins = async (directory) => {
  console.log(chalk.yellow(`[${directory}] Installing book plugins...`));

  await execAsync(`cd ${getBookFullPath(directory)} && node ${getGitBookCliDirectory()} install`);
};

const buildGitBook = async (directory) => {
  console.log(chalk.yellow(`[${directory}] Building book...`));

  await execAsync(`cd ${getBookFullPath(directory)} && node ${getGitBookCliDirectory()} build`);
};

const copyBuildArtifact = (distributionPath, source, destination) => {
  console.log(chalk.yellow(`[${destination}] Copying book...`));

  return new Promise(((resolve, reject) => {
    ncp(`${getBookFullPath(source)}/_book`, `${distributionPath}/${destination}`, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  }));
};

module.exports = async (configFile) => {
  try {
    const config = readConfiguration(configFile);

    clearWorkingDirectory(config.outputDirectory);

    await AsyncUtils.forEach(config.books, async (book) => {
      await installBookPlugins(book.source);
      await buildGitBook(book.source);
      await copyBuildArtifact(configFile.outputDirectory, book.source, book.destination);
    });
  } catch (error) {
    console.error(chalk.red('Error while building books:'));
    console.error(chalk.red(error));

    process.exit(1);
  }
};
