'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

const clearWorkingDirectory = directory => {
  console.log('Preparing working directory...');

  if (fs.existsSync(directory)) {
    rimraf.sync(directory);
  }

  fs.mkdirSync(directory);
};

const getBookFullPath = directory => `${path.join(process.cwd(), directory)}`;

const getGitBookCliDirectory = () => path.join(__dirname, '../../../gitbook-cli/bin/gitbook');

const installBookPlugins = async directory => {
  console.log(`Installing book plugins (${directory})...`);

  await exec(`cd ${getBookFullPath(directory)} && node ${getGitBookCliDirectory()} install`);
};

const buildBook = async directory => {
  console.log(`Building book (${directory})...`);

  await exec(`cd ${getBookFullPath(directory)} && node ${getGitBookCliDirectory()} build`);
};

const copyBuildArtifact = async (distributionPath, source, destination) => {
  console.log(`Copying book (${destination})...`);

  await exec(`cp -r ${getBookFullPath(source)}/_book ${distributionPath}/${destination}`);
};

module.exports = async (configFile) => {
  const config = require(path.join(process.cwd(), configFile));
  const distPath = path.join(process.cwd(), config.dist);

  clearWorkingDirectory(distPath);

  try {
    await Promise.all(config.books.map(async book => {
      await installBookPlugins(book.source);
      await buildBook(book.source);
      await copyBuildArtifact(distPath, book.source, book.dest);
    }));

    console.log('Done!');
  } catch (error) {
    console.error('Error occurred while processing books');
    console.error(error);
  }
};
