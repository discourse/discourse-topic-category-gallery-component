import Component from "@ember/component";
import { classNames } from "@ember-decorators/component";
import TopicCategoryGallery from "../../components/topic-category-gallery";

@classNames(
  "discovery-navigation-bar-above-outlet",
  "topic-category-gallery-connector"
)
export default class TopicCategoryGalleryConnector extends Component {
  <template><TopicCategoryGallery /></template>
}
