type NamedSpec = (name: string, fn: () => any) => any;
type AnonSpec = (fn: () => any) => any;
type Spec = NamedSpec | AnonSpec;

declare var describe: NamedSpec;
declare var before: AnonSpec;
declare var after: AnonSpec;
declare var beforeEach: AnonSpec;
declare var afterEach: AnonSpec;
declare var it: NamedSpec;
