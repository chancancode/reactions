# Reactions

Source code for [https://reactions.live](https://reactions.live).

## Prerequisites

You will need the following things properly installed on your computer.

* [Git](https://git-scm.com/)
* [Docker](https://www.docker.com)
* [Xcode](https://developer.apple.com/xcode/) (optional, for the viewer app)

First, setup your development enviornment with:

```
SKIP_DEPLOY=1 ./bin/configure
```

Then, start the app by running:

```
./bin/start
```

To run the OS X fullscreen viewer app, open `viewer.xcodeproj` in Xcode, then:

* Product > Scheme > Select "viewer (Debug)"
* Product > Run

## Deploy

First, setup your development enviornment with:

```
SKIP_DEV=1 ./bin/configure
```

Then, deploy the app by running:

```
./bin/deploy
```

To build the OS X fullscreen viewer app, open `viewer.xcodeproj` in Xcode, then:

* Product > Scheme > Select "viewer (Release)"
* Product > Build
