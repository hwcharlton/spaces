# Spaces - A tmux environment configuration tool

`spaces` uses yaml configuration files to manage `tmux` environments and the
launching of panes in said environments.

_For example:_

```
spaces open my-project
```

Would open a preconfigured session specified in
`$XDG_CONFIG_HOME/spaces/workspaces/my-project.yaml`

Configuration files can specify multiple panes with unique directories,
environmental variables, commands, and more. From inside of a session,
`spaces` can be used to launch configured panes with shortcuts. The default
placement of panes in windows may be configured freely.

## Development

Currently, spaces is being actively developed, and can be considered to be in a
"pre-alpha" state. It is not in a complete state, and breaking changes should
be expected to happen _frequently_.

### Tasks and Priorities

#### Configuration File Specification

Making decisions regarding the specification and conventions for configuration
files is of top priority at the moment. Making breaking changes in the future
to the writing of configuration files will be costly. This cost will only
increase as the number of configuration files that myself or others have
written grows.

By coming up with a robust and expressive configuration file format will allow
for smooth growth of this project.

##### Considerations

- Expansion of environmental variables in configuration file
  - How can an environmental variable (e.g., `HOME`) be used within a
    configuration file?
  - If `$` is used to indicate an environmental variable to expand,
    how should a literal `$` be specified?
  - Should all fields expand environmental variables, or just a subset
    (e.g., paths)?
- How should "splits" (pane position and size) be specified?
  - Currently, this is specified as a list of configurations. While
    expressive, I have concerns with its complexity.
- Where should configuration files be placed?
  - Currently they are placed in `$XDG_CONFIG_HOME/spaces/workspaces`
  - Placing them in the `spaces` config root folder would be simpler, but may
    clutter that folder if other configuration (e.g., global configuration)
    needs placement there in the future.
