YAML_DATA = $(wildcard data/*.yml)
JSON_DATA = $(YAML_DATA:.yml=.json)

YAML_CONTEXTS = $(wildcard *.yml)
PRESENTATIONS = $(YAML_CONTEXTS:.yml=.html)

JS_SRC_FILES = $(wildcard src/*.js)
JS_LIB_FILES = $(wildcard lib/*.js)
JS_MIN_FILES = $(JS_SRC_FILES:src/%.js=js/%.min.js) \
               $(JS_LIB_FILES:lib/%.js=js/%.min.js)

FILES = index.html $(JS_MIN_FILES) $(PRESENTATIONS) $(JSON_DATA)

all: $(FILES)

.PHONY: all clean env-check run

run: all
	firefox -private -new-window index.html

env-check:
	@which mustache >/dev/null 2>&1 || (echo "Missing mustache ruby gem" && exit 1)
	@which uglifyjs >/dev/null 2>&1 || (echo "Missing uglify-js nodejs module" && exit 1)
	@which js-yaml  >/dev/null 2>&1 || (echo "Missing js-yaml nodejs module" && exit 1)
	@which jsonlint >/dev/null 2>&1 || (echo "Missing demjson python module" && exit 1)
	@which pandoc   >/dev/null 2>&1 || (echo "Missing pandoc" && exit 1)
	@echo 'All green !'

%.html: %.yml template.html.mustache slides.svg.mustache
	mustache $< template.html.mustache > $@

%.html: %.md
	pandoc --standalone -f markdown -t html5 $< > $@

js/%.min.js: src/%.js
	@mkdir -p js
	uglifyjs --screw-ie8 -m -c -o $@ $<

js/%.min.js: lib/%.js
	@mkdir -p js
	uglifyjs --screw-ie8 -m -c -o $@ $< 2>/dev/null

%.json: %.yml
	js-yaml -j $< | jsonlint -F > $@

clean:
	rm -f $(FILES)
