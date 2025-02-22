import {
  applicationGenerator,
  componentGenerator,
} from '@nrwl/angular/generators';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { RoutingScope } from '@schematics/angular/module/schema';

import { angularModuleGenerator } from './angular-module-generator';
import {
  applyTransformersToPath,
  findNgModuleClass,
  getInsertImportTransformer,
  readSourceFile,
} from './ast-utils';
import {
  findClosestModule,
  findDeclaringModule,
  findModulePaths,
  isRoutingModule,
} from './find-module';

describe('find-module', () => {
  it('should find module', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: 'test',
    });
    await angularModuleGenerator(tree, { name: 'test', project: 'test' });
    await componentGenerator(tree, {
      name: 'test',
      project: 'test',
      module: 'test',
    });
    const module = findDeclaringModule(
      tree,
      'apps/test/src',
      'apps/test/src/app/test/test.component.ts'
    );
    expect(module.filepath).toBe('apps/test/src/app/test/test.module.ts');
    expect(module.module.classDeclaration.name.text).toBe('TestModule');
  });

  it('should find module, skip non-declaring reference', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: 'test',
    });
    await angularModuleGenerator(tree, {
      name: 'test/bogus',
      flat: true,
      project: 'test',
    });
    applyTransformersToPath(tree, 'apps/test/src/app/test/bogus.module.ts', [
      getInsertImportTransformer('TestComponent', './test.component'),
    ]);
    await angularModuleGenerator(tree, { name: 'test', project: 'test' });
    await componentGenerator(tree, {
      name: 'test',
      project: 'test',
      module: 'test',
    });
    const module = findDeclaringModule(
      tree,
      'apps/test/src',
      'apps/test/src/app/test/test.component.ts'
    );
    expect(module.filepath).toBe('apps/test/src/app/test/test.module.ts');
    expect(module.module.classDeclaration.name.text).toBe('TestModule');
  });

  it('should find routing module', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: 'test',
    });
    await angularModuleGenerator(tree, {
      name: 'test',
      project: 'test',
      routing: true,
      routingScope: RoutingScope.Root,
    });
    await componentGenerator(tree, {
      name: 'test',
      project: 'test',
      module: 'test',
    });
    const modules = findModulePaths(
      tree,
      'apps/test/src',
      (path) => {
        return tree
          .read(path, 'utf-8')
          .includes('export class TestRoutingModule ');
      },
      '-routing.module.ts'
    );
    expect(modules).toEqual(['apps/test/src/app/test/test-routing.module.ts']);
  });

  it('should isRoutingModule', async () => {
    const tree = createTreeWithEmptyWorkspace();
    await applicationGenerator(tree, {
      name: 'test',
    });
    await angularModuleGenerator(tree, {
      name: 'test',
      project: 'test',
      routing: true,
      routingScope: RoutingScope.Root,
    });
    await angularModuleGenerator(tree, {
      name: 'sub-test',
      project: 'test',
      routing: true,
      routingScope: RoutingScope.Child,
      route: 'test',
      module: 'test',
    });
    await componentGenerator(tree, {
      name: 'test',
      project: 'test',
      module: 'test',
    });
    const modules = findModulePaths(tree, 'apps/test/src', (path) => {
      const source = readSourceFile(tree, path);
      const module = findNgModuleClass(source);
      return isRoutingModule(module, source);
    });
    expect(modules).toEqual([
      'apps/test/src/app/test/test-routing.module.ts',
      'apps/test/src/app/sub-test/sub-test-routing.module.ts',
    ]);
  });

  it('should findClosestModule', async () => {
    const moduleList = [
      'apps/test/src/app/test/sub/sub-routing.module.ts',
      'apps/test/src/app/app-routing.module.ts',
      'apps/test/src/app/something/else/complex/complex-routing.module.ts',
      'apps/test/src/app/complex/something/else/else-routing.module.ts',
      'apps/test/src/app/test/test-routing.module.ts',
      'apps/test/src/app/best/best-routing.module.ts',
      'apps/test/src/app/something/something-routing.module.ts',
    ];
    expect(findClosestModule(moduleList, 'apps/test/src', 'app/other')).toBe(
      'app-routing'
    );
    expect(
      findClosestModule(moduleList, 'apps/test/src', 'app/test/sub/deep')
    ).toBe('sub-routing');
    expect(findClosestModule(moduleList, 'apps/test/src', 'app/test/sub')).toBe(
      'sub-routing'
    );
    expect(findClosestModule(moduleList, 'apps/test/src', 'app/test')).toBe(
      'test-routing'
    );
    expect(findClosestModule(moduleList, 'apps/test/src', 'app')).toBe(
      'app-routing'
    );
    expect(
      findClosestModule(moduleList, 'apps/test/src', 'outside')
    ).toBeFalsy();
    expect(findClosestModule(moduleList, 'apps/other/src', 'app')).toBeFalsy();
  });
});
