# Cliente FTEQW para navegador

`ftewebgl.js` e `ftewebgl.wasm` não ficam versionados. O workflow
`.github/workflows/pages.yml` compila o FTEQW (GPL-2.0) a partir de um commit fixo
de <https://github.com/fte-team/fteqw> e coloca aqui, junto com `LICENSE-FTEQW.txt`
e `SOURCE.txt`, que apontam para o código-fonte exato do binário publicado.

O loader do Emscripten procura o `.wasm` na mesma pasta do `.js`, então os dois
precisam ficar juntos.

## Build local

```bash
git clone https://github.com/fte-team/fteqw.git && cd fteqw
git checkout f937b9d88f71fc4429db5fe56c6a98d922711b2e
# Emscripten 2.0.12 ativo no PATH (emsdk install 2.0.12 && emsdk activate 2.0.12)
cd engine
make FTE_TARGET=web makelibs
make -j"$(nproc)" FTE_TARGET=web gl-rel
cp release/ftewebgl.js release/ftewebgl.wasm /caminho/ftebrazil/vendor/fte/
```

Não copie binários ou assets de outro site. O `pak1.pak` comercial não entra aqui.
