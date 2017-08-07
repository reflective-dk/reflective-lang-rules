# The Reflective Rule Language #

This module includes a parser and examples for the _Reflective Rule Language_, a
DSL used to ensure the consistency of data stored in the Reflective Platform.

### In action ###

```
git clone git@bitbucket.org:iteration2/reflective-lang-rules.git
cd reflective-lang-rules
npm install
npm test
```

### Examples ###

The examples are found in the `examples` folder, where each `.pattern` file
defines a set of rules expressed using the _Reflective Rule Language_. The
corresponding ASTs generated by the parser can be found in the `generated`
folder.

Feel free to experiment with the language by changing some of the definitions, or
to create an example of your own. Running `grunt` from the command line will
clean out the `generated` folder and reparse everything found under `examples`.

### KOMBIT-klar ###

This example illustrates how the requirements posed by KOMBIT<sup>1</sup> can be
met using the _Reflective Rule Language_. The requirements were originally
published in the form of five mandatory registration patterns
(registreringsmønstre), and this example includes a `.pattern` file for each of
these:

* administrativ-organisation.pattern
* henvendelsessteder.pattern
* it-anvendelse.pattern
* organisatorisk-tilknytning.pattern
* udbetalende-enheder.pattern

The original requiments (in Danish) can be found here:

`examples/kombitklar/anvendelse-af-sts-organisation.pdf`

---
<sup>1</sup> IT architects working on behalf of the Danish municipalities
