YAML_DATA = $(wildcard data/*.yml)
JSON_DATA = $(YAML_DATA:.yml=.json)

YAML_CONTEXTS = $(wildcard *.yml)
PRESENTATIONS = $(YAML_CONTEXTS:.yml=.html)

JS_SRC_FILES = $(wildcard src/*.js)
JS_LIB_FILES = $(wildcard lib/*.js)
JS_MIN_FILES = $(JS_SRC_FILES:src/%.js=js/%.min.js) \
               $(JS_LIB_FILES:lib/%.js=js/%.min.js)

FILES = index.html $(JS_MIN_FILES) $(PRESENTATIONS) $(JSON_DATA)

DIST = tour-de-varnish-$(shell git rev-parse --short HEAD)

all: $(FILES)

dist: $(DIST).tar.gz

$(DIST).tar.gz: $(FILES) img/ woff/
	@tar -zcf $@ --transform s:^:$(DIST)/: $^

.PHONY: all clean env-check run show

run: all
	firefox -private -new-window index.html

# XXX: this is very racy, damn you firefoctopus :(
show: run
	@sleep 1
	@xdotool key F11

CHECK_CMD = @which $(1) >/dev/null 2>&1 || \
            (echo "error: missing$(2)" && exit 1)

env-check:
	$(call CHECK_CMD, mustache, "mustache ruby gem")
	$(call CHECK_CMD, uglifyjs, "uglify-js nodejs module")
	$(call CHECK_CMD, js-yaml,  "js-yaml nodejs module")
	$(call CHECK_CMD, jsonlint, "demjson python module")
	$(call CHECK_CMD, pandoc,   "pandoc")
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
	rm -f $(FILES) $(DIST).tar.gz
