SHELL := /bin/bash
PATH  := $(shell echo $${PATH//\.\/node_modules\/\.bin:/}):node_modules/.bin

SRC = $(wildcard src/*.js) $(wildcard src/**/*.js)
LIB = $(SRC:src/%=lib/%)
TST = $(wildcard test/*.js) $(wildcard test/**/*.js)
NPM = npm install --local > /dev/null && touch node_modules

CJS = babel --source-maps --presets es2015
WATCH = nodemon -w src -x

.PHONY: build dev clean
	
build: node_modules $(LIB)

dev: node_modules
	$(WATCH) "clear && time $(MAKE) --debug=b build | tail -n +8"

clean:
	@rm -rf $$(cat .gitignore)

lib/%.js: src/%.js
	@mkdir -p $(@D)
	@$(CJS) $< > $@

node_modules: package.json
	$(NPM)
node_modules/%:
	$(NPM)