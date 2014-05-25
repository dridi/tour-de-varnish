YAML_DATA = $(wildcard data/*.yml)
JSON_DATA = $(YAML_DATA:.yml=.json)

YAML_CONTEXTS = $(wildcard *.yml)
PRESENTATIONS = $(YAML_CONTEXTS:.yml=.html)

MISC = index.html js/tour-de-varnish.min.js

FILES = $(MISC) $(PRESENTATIONS) $(JSON_DATA)

all: $(FILES)

.PHONY: clean env-check

env-check:
	@which mustache >/dev/null 2>&1 || (echo "Missing mustache ruby gem" && exit 1)
	@which slimit   >/dev/null 2>&1 || (echo "Missing SlimIt python module" && exit 1)
	@which js-yaml  >/dev/null 2>&1 || (echo "Missing js-yaml nodejs module" && exit 1)
	@which jsonlint >/dev/null 2>&1 || (echo "Missing demjson python module" && exit 1)
	@which pandoc   >/dev/null 2>&1 || (echo "Missing pandoc" && exit 1)
	@echo 'All green !'

%.html: %.yml template.html.mustache slides.svg.mustache
	mustache $< template.html.mustache > $@

%.html: %.md
	pandoc --standalone -f markdown -t html5 $< > $@

%.min.js: %.js
	slimit -m $< > $@

%.json: %.yml
	js-yaml -j $< | jsonlint -F > $@

clean:
	rm -f $(FILES)
