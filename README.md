# gitbook-multi-build

Tool for building multiple GitBook books with single command. Under the hood it utilizes [GitBook Toolchain](https://toolchain.gitbook.com) to install all book plugins, build the book (as it would be build on [legacy.gitbook.com](https://legacy.gitbook.com)) and then copy build artifact to specified directory.

## Installation

    npm i gitbook-multi-build

## Configuration

Example configuration file (from [content.gitguts.io](https://github.com/gitguts/content.gitguts.io/blob/master/books.json)):

```json
{
  "books": [{
    "source": "books/introduction",
    "destination": "introduction"
  },{
    "source": "books/introduction-prework",
    "destination": "introduction-prework"
  }, {
    "source": "books/repository-prework",
    "destination": "repository-prework"
  }, {
    "source": "books/repository",
    "destination": "repository"
  }],
  "output": "dist"
}
```

Above JSON configuration needs to be saved in a file (f.e. books.json) and later on passed as an argument to CLI tool.

### books

List of GitBook projects to build and copy over to output directory. Each book needs to have two properties:

* source - relative path to book root directory
* destination - name of the directory to which build book needs to be copied within specified output directory

### output

Name of the directory to which all of the books will be copied after being build. Output directory will be created in directory from where tool gets executed.

**Important**: Output directory is considered a temporary which means that before each and every build it will be removed (if exists) and created from scratch. 


## Usage

Assuming configuration file is stored in file named **books.json** build command would look like this:

```bash
node node_modules/gitbook-multi-build/bin/index build books.json
```

Tool help command can be executed as following:

```bash
node node_modules/gitbook-multi-build/bin/index --help
```

Example tool invocation using Node.js package.json script can be found in [this file](https://github.com/gitguts/content.gitguts.io/blob/master/package.json).

## License

MIT.

## Bugs

See <https://github.com/Smoczysko/gitbook-multi-build/issues>.
