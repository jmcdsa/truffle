import { logger } from "@truffle/db/logger";
const debug = logger("db:loaders:resources:compilations");

import {
  CompilationData,
  LoadedSources,
  Load
} from "@truffle/db/loaders/types";

import { AddCompilations } from "./add.graphql";
export { AddCompilations };

export { GetCompilation } from "./get.graphql";

const compilationSourceInputs = ({
  compilation,
  sources
}: LoadableCompilation): DataModel.ResourceReferenceInput[] =>
  compilation.sources.map(({ input: { sourcePath } }) => sources[sourcePath]);

const compilationProcessedSourceInputs = ({
  compilation,
  sources
}: LoadableCompilation): DataModel.ProcessedSourceInput[] =>
  compilation.sources.map(({ input: { sourcePath }, contracts }) => ({
    source: sources[sourcePath],
    // PRECONDITION: all contracts in the same compilation with the same
    // sourcePath must have the same AST
    ast: contracts[0].ast
      ? { json: JSON.stringify(contracts[0].ast) }
      : undefined
  }));

const compilationSourceMapInputs = ({
  compilation
}: LoadableCompilation): DataModel.SourceMapInput[] => {
  const contracts = compilation.sources
    .map(({ contracts }) => contracts)
    .flat();

  const sourceMaps = contracts
    .map(({ sourceMap, deployedSourceMap }) => [sourceMap, deployedSourceMap])
    .flat()
    .filter(Boolean);

  if (sourceMaps.length) {
    return sourceMaps.map(sourceMap => ({ json: sourceMap }));
  }
};

const compilationInput = (
  data: LoadableCompilation
): DataModel.CompilationInput => ({
  compiler: data.compilation.compiler,
  processedSources: compilationProcessedSourceInputs(data),
  sources: compilationSourceInputs(data),
  sourceMaps: compilationSourceMapInputs(data)
});

type LoadableCompilation = {
  compilation: CompilationData;
  sources: LoadedSources;
};

export function* generateCompilationsLoad(
  loadableCompilations: LoadableCompilation[]
): Load<DataModel.Compilation[], "compilationsAdd"> {
  const compilations = loadableCompilations.map(compilationInput);

  const result = yield {
    request: AddCompilations,
    variables: { compilations }
  };

  return result.data.compilationsAdd.compilations;
}
