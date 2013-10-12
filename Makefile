FILES = index.html js/tour-de-varnish.min.js

all: build

install-check:
	@which mustache >/dev/null 2>&1 || (echo "Missing mustache ruby gem" && exit 1)
	@which slimit   >/dev/null 2>&1 || (echo "Missing SlimIt python module" && exit 1)
	@echo 'All green !'

build: $(FILES)

index.html: context.yml *.mustache
	mustache $< $@.mustache > $@

%.min.js: %.js
	slimit -m $< > $@

clean:
	rm -f $(FILES)
