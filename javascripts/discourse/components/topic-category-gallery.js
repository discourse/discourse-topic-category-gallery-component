import { ajax } from "discourse/lib/ajax";
import { bind } from "discourse-common/utils/decorators";
import GlimmerComponent from "discourse/components/glimmer";
import { inject as service } from "@ember/service";
import { Promise } from "rsvp";
import { tracked } from "@glimmer/tracking";
import { scrollTop } from "discourse/mixins/scroll-top";

const categoryTopicConfig = JSON.parse(settings.category_galleries);

export default class TopicCategoryGallery extends GlimmerComponent {
  @service router;
  @tracked galleryOnly;
  @tracked topicContent;
  @tracked isLoading;
  @tracked showFor = false;
  

  @bind
  currentCategory() {
    return this.router.currentRoute?.attributes?.category?.id;
  }

  @bind
  configuredCategory() {
    if (categoryTopicConfig.length) {
      return categoryTopicConfig.find(
        (setting) => parseInt(setting.category, 10) === this.currentCategory()
      );
    }
  }



  _getTopicContent() {
    if (this.currentCategory() && this.configuredCategory()) {
      this.isLoading = true;
      this.showFor = true;
      let id = parseInt(this.configuredCategory().topic, 10);

      this.galleryOnly = this.configuredCategory().galleryOnly;


      let topicContent = ajax(`/t/${id}.json`).then((result) => {
        return result.post_stream.posts[0].cooked;
      });
      Promise.all([topicContent]).then((result) => {
        this.topicContent = result[0];
        this.isLoading = false;
        scrollTop();
      });
    } else {
      this.isLoading = false;
      this.showFor = false;
    }
  }

  constructor() {
    super(...arguments);
    this.appEvents.on("page:changed", this, this._getTopicContent);
  }

  willDestroy() {
    this.appEvents.off("page:changed", this, this._getTopicContent);
  }

}
