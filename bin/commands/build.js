'use strict';

const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');
const { execSync } = require('child_process');

const clearWorkingDirectory = directory => {
  console.log('Preparing working directory...');

  if (fs.existsSync(directory)) {
    rimraf.sync(directory);
  }

  fs.mkdirSync(directory);
};

const getBookFullPath = directory => `${path.join(process.cwd(), directory)}`;

const getGitBookCliDirectory = () => path.join(__dirname, '../../../gitbook-cli/bin/gitbook');

const installBookPlugins = directory => {
  console.log(`Installing book plugins (${directory})...`);

  execSync(`cd ${getBookFullPath(directory)} && node ${getGitBookCliDirectory()} install`);
};

const buildBook = directory => {
  console.log(`Building book (${directory})...`);

  execSync(`cd ${getBookFullPath(directory)} && node ${getGitBookCliDirectory()} build`);
};

const copyBuildArtifact = (distributionPath, source, destination) => {
  console.log(`Copying book (${destination})...`);

  execSync(`cp -r ${getBookFullPath(source)}/_book ${distributionPath}/${destination}`);
};

module.exports = (configFile) => {
  const config = require(path.join(process.cwd(), configFile));
  const distPath = path.join(process.cwd(), config.dist);

  try {
    clearWorkingDirectory(distPath);

    config.books.map(book => {
      installBookPlugins(book.source);
      buildBook(book.source);
      copyBuildArtifact(distPath, book.source, book.dest);
    });
  } catch (error) {
    console.error('Error occurred while processing books');
    console.error(error);

    process.exit(1);
  }
};
