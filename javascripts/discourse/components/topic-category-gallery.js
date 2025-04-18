import Component from "@glimmer/component";
import { tracked } from "@glimmer/tracking";
import { action } from "@ember/object";
import { service } from "@ember/service";
import { Promise } from "rsvp";
import { ajax } from "discourse/lib/ajax";
import { bind } from "discourse/lib/decorators";
import DiscourseURL from "discourse/lib/url";
import { scrollTop } from "discourse/lib/scroll-top";

const categoryTopicConfig = JSON.parse(settings.category_galleries);

export default class TopicCategoryGallery extends Component {
  @service router;
  @service appEvents;

  @tracked isLoading;
  @tracked showFor = false;

  constructor() {
    super(...arguments);
    this.appEvents.on("page:changed", this, this._getTopicContent);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    this.appEvents.off("page:changed", this, this._getTopicContent);
  }

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
      this.galleryOnly = this.configuredCategory().galleryOnly;

      let id = parseInt(this.configuredCategory().topic, 10);

      let topicContent = ajax(`/t/${id}.json`).then((result) => {
        this.topicId = result.id;
        return result.post_stream.posts[0].cooked;
      });
      Promise.all([topicContent]).then((result) => {
        let htmlWrapper = document.createElement("div");
        htmlWrapper.innerHTML = result[0];

        let imageList = htmlWrapper.querySelectorAll("img");

        this.topicContent = imageList;
        this.isLoading = false;
        scrollTop();
      });
    } else {
      this.isLoading = false;
      this.showFor = false;
    }
  }

  @action
  visitTopic(e) {
    e.preventDefault();
    DiscourseURL.routeTo(`/t/${this.topicId}`);
  }
}
