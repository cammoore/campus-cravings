import { Selector } from 'testcafe';

class ListFavoritesPage {
  constructor() {
    this.pageId = '#listfavorites-page';
    this.pageSelector = Selector(this.pageId);
  }

  /** Asserts that this page is currently displayed. */
  async isDisplayed(testController) {
    await testController.expect(this.pageSelector.exists).ok();
    await testController.click('#listfavorites-page');
    await testController.click('#bottom-footer');
    await testController.wait(1000);
  }
}

export const listFavoritesPage = new ListFavoritesPage();
