# AWS Credential Switcher

Simple CLI tool that allows you to quickly toggle between AWS CLI profiles. It works by replacing the values of `default` profile with the profile you select.

> **NOTE:** This tool updates your local `~/.aws/credentials` file. Though we create a backup, it's recommended you create manual backup first.

## 💿 Installation
```
npm i -G aws-credential-switcher
```

## 💻 Usage
```
aws-switch
```
or
```
aws-switch --credentialFile {fileLocation}
```
![](https://github.com/dburdan/aws-credential-switcher/blob/master/assets/cli.png?raw=true)

## License
[MIT](https://choosealicense.com/licenses/mit/)
