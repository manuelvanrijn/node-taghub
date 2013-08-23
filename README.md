# taghub

Small commandline tool to compare the latest tags of your and their github repository.

## Why?

I have a few Rails gems that include some external projects. Ofcourse I like to have the latest version of the external project in my gem so I have to keep track of newer versions.

## Install

```
npm install taghub -g
```

## Commands

```
-h, --help                show usage information
-V, --version             show version number
-l, --list                show a list of compare tasks
-a, --add [name]          create a compare task with [name]
-r, --remove [name]       remove the compare task [name]
-t, --task [name]         only compare the tag versions of task [name]
(no args)                 compare all compare task tag versions
```

## Sample output

```
+-----------------------------------------------------------------+
¦ name                     ¦ description        ¦ theirs ¦ yours  ¦
+--------------------------+--------------------+--------+--------¦
¦ [bootstrap-switch-rails] ¦ versions are equal ¦ v1.8.0 ¦ v1.8.0 ¦
+-----------------------------------------------------------------+
```

## Changes

| Version | Notes |
| -------:| ----------------------------------------------------------------------------------- |
| 0.0.2   | Minor fixes                                                                         |
| 0.0.1   | Initial release                                                                     |

## License

The node-taghub project is licensed under the [MIT License](LICENSE.txt)

## Contributing

- Fork it
- Create your feature branch (`git checkout -b my-new-feature`)
- Commit your changes (`git commit -am 'Add some feature'`)
- Push to the branch (`git push origin my-new-feature`)
- Create new Pull Request
