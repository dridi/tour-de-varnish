# Around _Varnish_ in eighty days

## TL;DR

This is a presentation intended to help you grasp the basics of Varnish Cache.
The contents are in French but the code is in English, you can
[~~watch it~~](https://dridi.github.io/tour-de-varnish) at your own risks,
I've suffered a couple Firefox crashes during the development caused by some
SFX. The talk was organized by Zenika and Varnish Software and hosted in both
Lyon and Paris by Zenika.

## History

> ‒ Boss, can I take a couple days to play with HTML5, CSS3, SVG and WebGL ?
>
> ‒ No.

One week later...

> ‒ Boss, I need a couple days for the upcoming Varnish presentation.
>
> ‒ Ok.

## What is it ?

This is a web presentation with slides written in SVG, for easier scaling, and
a rotating earth for the _traveling around the world_ part. This is obviously
inspired by Jules Verne's _Around the World in Eighty Days_. In this talk, you
discover Varnish Cache, how it works, and how awesome it is `;-)`.

The result is nice, but this is just my opinion and  my eye-candy-o-meter has
very low standards. The big limitation is that AFAIK, it only works on Linux
with Firefox 20+. It doesn't work with WebKit-based browsers (but you could
still send me a pull request :) and the bottom line is that it works on the
speaker's laptop (that would be mine) so it's fine.

## Why did you do that ?

Well, this is embarassing... You know those developers bitching about how you
should [KISS](https://fr.wikipedia.org/wiki/Keep_it_Simple,_Stupid) and stuff.
I'm one of them, but when it comes to my own project, I fail and happily create
a lot of complexity. And it was fun.

## What's the license ?

I need to double check the assets licenses for both the contents and code. It
will probably be a flavour of CC for the presentation and BSD for the code.

I believe the use of the images falls into fair use, they were shamelessly
stolen from:
* http://www.zenika.com/
* https://www.varnish-software.com/
* https://www.xkcd.com/192/
* https://www.xkcd.com/1095/
* http://www.unixstickers.com/trollface-coolface-problem-meme-shaped-sticker
* https://upload.wikimedia.org/
* https://github.com/bsdphk
* https://github.com/varnish/Varnish-Book/
* http://www.freebsd.org/
* https://www.kernel.org/
* https://virtualbox.org/
* http://www.userlogos.org/node/12239/17750
* http://www.vagrantup.com/
* https://github.com/tsaastam/cljs-webgl-example
* http://www.blankmaninc.com/the-purge-worth-killing-over-no-spoilers
* https://onnecar.wordpress.com/?s=cat
* https://secure.flickr.com/photos/grantzprice/
* http://www.tumblr.com/tagged/tumblr-face
* https://secure.flickr.com/photos/crucially/3716344792/sizes/o/
* http://www.achievementgen.com


## How does it work ?

It's an HTML page, an SVG file, a javascript file, and json data. The script
currently reads files from harcoded paths, but at least it's data-driven,
which helped a lot during the building of the presentation.

### `tour-de-varnish.js`

It contains several classes:
* `Stage` : the orchestrator, it relies on actions
  * `EarthWakker` : travels around the earth
  * `Slider` : displays slides
  * ...
* `Earth` : the 3D sphere
* ...

Under the hood, it relies on [jQuery](http://jquery.com/) and
[three.js](http://threejs.org/).

### `destinations.json`

This file contains a map of available destinations around the world, and
coordinates on the sphere.

```json
{
        "france": {
                "rx": 0.84,
                "ry": 4.65,
                "steps": [{"cx": 520, "cy": 120}]
        },
        "norway": {
                "rx": 1.10,
                "ry": 4.50,
                "steps": [{"cx": 535, "cy": 82}]
        },
        [...]
        "hawaii": {
                "rx": 0.36,
                "ry": 1.17,
                "bx": true,
                "steps": [{"cx": 65, "cy": 197}]
        },
        "america": {
                "rx": 0.30,
                "ry": 6.26,
                "steps": [{"cx": 320, "cy": 276}, {"cx": 192, "cy": 146}]
        },
        [...]
}

```

For each destination, `rx` and `ry` are the 3D rotation angles to reach for
the destination to be centered on the screen. A destination contains [1..)
`steps` (where we travel) represented as 2D coordinates on the texture. The
`Earth` object assumes a texture of `1024x512` pixels and will draw a path
between destinations and a spot on the destinations. Destinations can be used
in any order and even several times, it's the `Earth`'s job to draw the path
aniway... The `bx` parameter indicates that the X axis boundary of the texture
must be crossed. It is implemented to the bare minimum and will probably not
work with a backward rotation.

### `route.json`

This file contains a list of actions to take during the travel.

```json
[
        {
                "clazz": "Slider",
                "args": "['title']"
        },
        {
                "clazz": "Globe",
                "args": "earth"
        },
        {
                "clazz": "EarthWalker",
                "args": "earth, destinations.france, 0"
        },
        {
                "clazz": "Slider",
                "args": "['verne', 'red_herring', 'me']"
        },
        {
                "clazz": "EarthWalker",
                "args": "earth, destinations.norway, 2000"
        },
        {
                "clazz": "Slider",
                "args": "['norway', 'principle']"
        },
        {
                "clazz": "EarthWalker",
                "args": "earth, destinations.russia, 1000"
        },
        [...]
]

```

The `clazz` field contains the class name of the action to use, and `args`
holds the parameters for the constructor. It's really ugly under the hood.

# TODO

Maybe one day...

- ☑ make the talk
- ☐ learn javascript (because the code sucks)
- ☐ backward navigation
- ☐ add a build system
- ☐ fix race conditions
- ☐ fix performance issues
