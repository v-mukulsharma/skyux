import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'key-info',
    loadChildren: () =>
      import('./key-info/key-info.module').then((m) => m.KeyInfoModule),
  },
  {
    path: 'status-indicator',
    loadChildren: () =>
      import('./status-indicator/status-indicator.module').then(
        (m) => m.StatusIndicatorModule
      ),
  },
  {
    path: 'wait',
    loadChildren: () => import('./wait/wait.module').then((m) => m.WaitModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IndicatorsRoutingModule {}

@NgModule({
  imports: [IndicatorsRoutingModule],
})
export class IndicatorsModule {
  public static routes = routes;
}
