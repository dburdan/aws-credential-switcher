# AWS Credential Switcher

Simple CLI tool that allows you to quickly toggle between AWS CLI profiles. It works by replacing the values of `default` profile with the profile you select.

![](https://github.com/dburdan/aws-credential-switcher/blob/master/assets/cli.png?raw=true)

## 💿 Installation
```
npm i -G aws-credential-switcher
```

## 💻 Usage
> **NOTE:** This tool updates your local `~/.aws/credentials` and `~/.aws/config` files. Though we create a backup, it's recommended you create manual backups first.
```
aws-switch
```
or
```
aws-switch --credentialFile {fileLocation} --configFile {fileLocation}
```

## 🗒 Notes
Since this tool also updates the AWS config file, it's recommended you add a config option for each profile, even if they're duplicates.
#### `~/.aws/credentials`
```
[personal]
aws_access_key_id=abcedf
aws_secret_access_key=abcedf

[work]
aws_access_key_id=abcedf
aws_secret_access_key=abcedf
```
#### `~/.aws/config`
```
[profile personal]
region=us-west-2
output=json

[profile work]
region=us-east-1
output=json
```

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)
