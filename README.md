# Around _Varnish_ in Eighty Days

## TL;DR

This is a presentation intended to help you grasp the basics of Varnish Cache.
The contents are in French but the code is written and documented in English,
you can [watch it](http://dridi.github.io/tour-de-varnish) at your own risks,
I've suffered a couple Firefox crashes during the development caused by some
SFX.  The talk was organized by Zenika and Varnish Software and hosted in both
Lyon and Paris by Zenika. The presentation is meant to be displayed in a 4:3
aspect ratio, but it will scale to any resolution. You can use the responsive
view of your browser to enforce a proper resolution. Use the space bar to go
through the presentation.

## History

> ‒ Boss, can I take a couple days to play with HTML5, CSS3, SVG and WebGL ?
>
> ‒ No.

One week later...

> ‒ Boss, I need a couple days for the upcoming Varnish presentation.
>
> ‒ OK.

## What is it ?

This is a web presentation with slides written in SVG, for easier scaling, and
a rotating earth for the _traveling around the world_ part. This is obviously
inspired by Jules Verne's _Around the World in Eighty Days_. In this talk, you
discover Varnish Cache, how it works, and how awesome it is `;-)`.

The result is nice, but this is just my opinion and my eye-candy-o-meter has
very low standards. The big limitation is that it's designed to work at least
on the speaker's laptop (that would be mine, Firefox on Linux). If it doesn't
work for you, do not hesitate to report an issue or send a pull request `:)`.

## Why did you do that ?

Well, this is embarrassing... You know those developers bitching about how you
should [KISS](https://fr.wikipedia.org/wiki/Keep_it_Simple,_Stupid) and stuff.
I'm one of them, but when it comes to my own projects, I fail and happily
create a lot of complexity. And it was fun.

## What's the license ?

The code is distributed under the terms of the 2-clause BSD license (see
LICENSE-BSD for more information) and the contents of the talks (the slides)
are in the Public Domain where applicable. Otherwise, the slides are
distributed under the terms of the _Do WTF You Want To Public License v2_ (see
LICENSE-WTFPL for more information).

### Dependencies

Tour de Varnish relies on [jquery](http://jquery.com/) and
[three.js](http://threejs.org/), both distributed under the terms of the
[MIT](http://www.opensource.org/licenses/MIT) license.

### Build Dependencies

To build the slides, you will need the following programs in your `PATH`:
- mustache
- uglify-js
- js-yaml
- jsonlint
- pandoc

You can check your environment by running `make env-check`.

# Images

I believe the use of the images falls into fair use, they were
shamelessly stolen from various places including:

* http://www.zenika.com/
* https://www.varnish-cache.org/
* https://www.varnish-software.com/
* http://www.unixstickers.com/trollface-coolface-problem-meme-shaped-sticker
* https://github.com/bsdphk
* http://www.freebsd.org/
* https://www.kernel.org/
* https://virtualbox.org/
* http://www.userlogos.org/node/12239/17750
* http://www.vagrantup.com/
* https://github.com/tsaastam/cljs-webgl-example
* http://www.blankmaninc.com/the-purge-worth-killing-over-no-spoilers
* https://onnecar.wordpress.com/?s=cat
* http://www.tumblr.com/tagged/tumblr-face
* http://www.achievementgen.com

### Fonts

The [Liberation](https://www.redhat.com/promo/fonts/) fonts are distributed
under the terms of the GPL+exception license. The
[Overlock](http://www.fontsquirrel.com/license/overlock) fonts are distributed
under the terms of the SIL Open Font License 1.1.

## How does it work ?

It's an HTML page, an SVG file, a javascript file, and json data. There is a
little build system that puts the SVG file inside the HTML page, and
substitutes reference to files by the actual file names. Json files are now
generated from YAML. Repeat after me: _"Json is not a hand-writing-friendly
serialization format"_.

```bash
$ make run
```

You can first check that everything needed for the build is installed:

```bash
$ make env-check
All green !
```

### `tour-de-varnish.js`

It contains several classes:
* `Stage` : the orchestrator, it relies on actions
  * `EarthWalker` : travels around the earth
  * `Slider` : displays slides
  * ...
* `Earth` : the 3D sphere
* ...

Under the hood, it relies on [jQuery](http://jquery.com/) and
[three.js](http://threejs.org/).

### `destinations.yml`

This file contains a map of available destinations around the world, and
coordinates on the sphere.

```yaml
---
france:
  rx:  0.84
  ry: -1.63
  steps:
    - cx: 520
      cy: 120
norway:
  rx: 1.10
  ry: -1.78
  steps:
    - cx: 535
      cy: 82
[...]
hawaii:
  rx: 0.36
  ry: 1.17
  bx: true
  steps:
    - cx: 65
      cy: 197
america:
  rx: 0.30
  ry: -0.02
  steps:
    - cx: 320
      cy: 276
    - cx: 192
      cy: 146
```

For each destination, `rx` and `ry` are the 3D Euler rotation angles to reach
for the destination to be centered on the screen. A destination contains [1..)
`steps` (where we travel) represented as 2D coordinates on the texture. The
`Earth` object assumes a texture of `1024x512` pixels and will draw a path
between destinations and a spot on the destinations. Destinations can be used
in any order and even several times, it's the `Earth`'s job to draw the path
anyway...  The `bx` parameter indicates that the X axis boundary of the texture
must be crossed. It is implemented to the bare minimum and will probably not
work with a backward rotation.

### `{{route}}.yml`

This file contains a list of actions to take during the travel.

```yaml
---
- clazz: Slider
  args:
    - zenika-title
- clazz: Globe
- clazz: EarthWalker
  args:
    destination: france
    wait: 0
    duration: 1000
- clazz: Slider
  args:
    - verne
    - red_herring
    - me
- clazz: EarthWalker
  args:
    destination: norway
    wait: 2000
    duration: 300
- clazz: Slider
  args:
    - norway
    - principle
[...]
```

The `clazz` field contains the class name of the action to use, and `args`
holds the parameters for the action.

# TODO

Maybe one day...

- ☑ make the talk
- ☐ learn javascript (because the code is horrible)
- ☐ backward navigation
- ☑ add a build system
- ☐ fix race conditions
- ☐ fix performance issues
- ☑ get rid of json
