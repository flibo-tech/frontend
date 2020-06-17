<template>
    <div v-if="renderComponent">
        <div v-if="fetching_profile & !own_profile"
             class="fetching-profile-message">
            <div class="sk-folding-cube">
                <div class="sk-cube1 sk-cube"></div>
                <div class="sk-cube2 sk-cube"></div>
                <div class="sk-cube4 sk-cube"></div>
                <div class="sk-cube3 sk-cube"></div>
            </div>
            <br>
            <div class="quote-font">
                {{store.quotes[Math.floor(Math.random() * 22)]}}
            </div>
        </div>

        <div style="position: relative; width: 95%;margin-left: 2.5%;"
             v-if="(!fetching_profile) | own_profile">
            <div class="content-type-tabs"
                 :style="(is_mobile) ? '' : 'right: calc(50vw - 500px);'">
                <a @click="switchProfileContentType">
                    {{(content_type == 'movie') ? 'Movies' : 'TV Series'}}
                </a>
                <button class="profile-show-switch"
                        v-if="store.notifications.never_seen_profile_switch"/>
            </div>

            <div :class="(is_mobile) ? 'profile-cover' : 'desktop-profile-cover'">
                <img v-for="item, index in posters"
                    v-bind:class="'poster-'+(index+1)"
                    @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self_' : 'other_')+'cover')"
                    v-bind:src="item.poster"/>

                <img v-for="item, index in covers"
                    v-bind:class="'cover-'+(index+1)"
                    @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self_' : 'other_')+'cover')"
                    v-bind:src="item.cover"/>
            </div>

            <div :class="(is_mobile) ? 'profile-pp-cropper' : 'desktop-profile-pp-cropper'">
                <img v-bind:src="profile_picture"
                     onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
                     class="profile-pp">
            </div>

            <div :class="(is_mobile) ? 'user-name' : 'desktop-user-name'"
                 :style="own_profile ? '' : 'width: 50%;margin-left: 25%;'">
                <h4>
                    {{user_name}}

                    <span class="share-icon"
                          v-if="own_profile"
                          @click="promptShareProfile"/>

                    <span class="friendship-status"
                        v-if="['other', 'request_sent', 'friend'].includes(user_type)"
                        @click="(user_type=='friend') ? (prompt=true) :
                                ['request_sent'].includes(user_type) ? unfriend('request_sent') :
                                (['other'].includes(user_type)) ? sendRequest() : ''"
                        :style="(['other'].includes(user_type)) ? `color: #ffffff;
                                                                                    background-color: #3366BB;
                                                                                    padding: 5px;
                                                                                    border: none;` : ''">

                        {{(user_type=='friend') ? 'Connection' :
                            ['request_sent'].includes(user_type) ? 'Requested' :
                            (['other'].includes(user_type)) ? 'Connect' : ''}}
                    </span>

                    <span v-if="user_type == 'unapproved'"
                        class="approve-request"
                        @click="approveRequest">
                        Accept
                    </span>

                    <span v-if="user_type == 'unapproved'"
                        class="reject-request"
                        @click="unfriend('unapproved')">
                        Reject
                    </span>
                </h4>
            </div>

            <div :class="(is_mobile) ? 'profile-details' : 'desktop-profile-details'">
                <div class="profile-status"
                    v-if="own_profile"
                    @click="update_profile_status=!update_profile_status">
                    <div :style="profile_status_icon"/>
                    <div class="profile-status-title">
                        Status
                    </div>
                </div>

                <div class="profile-connections"
                    @click="goToFriends"
                    v-if="own_profile">
                    Connections
                    <span style="font-size: 22px;position: relative;">
                        {{store.friends_page.friends.length}}
                    </span>

                    <button v-if="store.notifications.friends | store.notifications.requests"
                            class="profile-connections-notification"
                            :style="(is_mobile) ? '' : 'margin-left: 41px;'"/>
                </div>

                <div class="profile-connections"
                     style="width: 45px;margin-left: calc(33.33% - 75.5px);"
                     @click="profile_vies_desc=!profile_vies_desc"
                     v-if="own_profile & profile_vies_desc">
                     Views
                     <span style="font-size: 22px;position: relative;">
                         {{profile_views}}
                     </span>
                </div>

                <div class="profile-views"
                     @click="profile_vies_desc=!profile_vies_desc"
                     v-if="own_profile & !profile_vies_desc">
                    <div class="profile-views-icon"/>
                    <div class="profile-views-count">
                        {{profile_views}}
                    </div>
                </div>

                <div class="profile-more"
                    v-if="own_profile"
                    :style="(profile_vies_desc) ? 'margin-left: calc(33.33% - 70.5px - 37.5px);' : ''"
                    @click="openProfileMore = !openProfileMore"/>
            </div>

            <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
                <div>
                    <div v-if="openProfileMore"
                        class="black-background"
                        @click="openProfileMore=false"/>
                    <div class="profile-more-options"
                        v-if="openProfileMore">

                        <div class="profile-more-option"
                             style="margin-top: 10px;"
                             @click="$router.push('/settings')">
                            <div :style="profile_more_settings"/>
                            <span class="profile-more-option-text">
                                Country & Platforms
                            </span>
                        </div>

                        <div class="profile-more-option"
                             style="margin-top: 5px;"
                            @click="goToAboutUs">
                            <div class="profile-more-about-us"/>
                            <span class="profile-more-option-text">
                                About Us
                            </span>
                        </div>

                        <div class="profile-more-option"
                             style="margin-bottom: 1px;"
                             @click="logOut">
                            <div class="profile-more-logout"/>
                            <span class="profile-more-option-text" style="color: #f54029;">
                                Logout
                            </span>
                        </div>

                    </div>
                </div>
            </transition>

            <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
                <div>
                    <div v-if="prompt"
                        class="black-background"
                        @click="prompt=!prompt"/>

                    <div class="prompted-box"
                        :style="(is_mobile) ? 'min-width: 250px;' : 'min-width: 250px;'"
                            v-if="prompt">
                        <div class="prompted-user-cropper"
                             :style="(is_mobile) ? '' : 'width: 100px;height: 100px;'">
                            <img v-bind:src="profile_picture"
                                 onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
                            class="prompted-user-pic"/>
                        </div>

                        <div class="prompted-user-name"
                             :style="(is_mobile) ? '' : 'font-size: 15px;'">
                            {{user_name}}
                        </div>

                        <p :style="(is_mobile) ? '' : 'font-size: 15px;'">
                            Remove connection?
                        </p>

                        <div class="profile-prompted-buttons">
                            <div class="prompted-cancel-button"
                                    @click="prompt=!prompt">
                                Cancel
                            </div>
                            <div class="prompted-confirm-button"
                                    @click="unfriend('friend')">
                                Remove
                            </div>
                        </div>
                    </div>
                </div>
            </transition>

            <transition appear
                        enter-active-class="animated fadeIn"
                        leave-active-class="animated fadeOut">
                <div>
                    <div v-if="update_profile_status"
                        class="black-background"
                        @click="update_profile_status=!update_profile_status"/>

                    <div :class="(is_mobile) ? 'update-profile-status' : 'desktop-update-profile-status'"
                        v-if="update_profile_status">

                        <div :style="(is_mobile) ? 'text-align:left; padding:2%;font-size: 3.4vw;' : 'text-align:left; padding-bottom:10px;font-size: 15px;'">
                            Your profile items should be visible to...
                        </div>

                        <div :class="(is_mobile) ? 'profile-status-checkbox' : 'desktop-profile-status-checkbox'"
                            @click="updateProfileStatus('public')">
                            <input type="radio"
                                    value="public"
                                    v-model="profile_status"
                                    class="checkbox-input">
                            <span :class="(is_mobile) ? 'profile-status-checkmark-abled' : 'desktop-profile-status-checkmark-abled'"/>
                            <span class="profile-status-public-option-icon"
                                  :style="(is_mobile) ? '' : 'margin-left: 50px;margin-top: 0px;height: 35px;width: 35px;'"/>
                            <span class="profile-status-checkmark-text">Public</span>
                        </div>

                        <div :class="(is_mobile) ? 'profile-status-checkbox' : 'desktop-profile-status-checkbox'"
                            @click="updateProfileStatus('friends')">
                            <input type="radio"
                                    value="friends"
                                    v-model="profile_status"
                                    class="checkbox-input">
                            <span :class="(is_mobile) ? 'profile-status-checkmark-abled' : 'desktop-profile-status-checkmark-abled'"/>
                            <span class="profile-status-friends-option-icon"
                                  :style="(is_mobile) ? '' : 'margin-left: 50px;margin-top: 0px;height: 35px;width: 35px;'"/>
                            <span class="profile-status-checkmark-text">Connections</span>
                        </div>

                        <div :class="(is_mobile) ? 'profile-status-checkbox' : 'desktop-profile-status-checkbox'"
                            @click="updateProfileStatus('private')">
                            <input type="radio"
                                    value="private"
                                    v-model="profile_status"
                                    class="checkbox-input">
                            <span :class="(is_mobile) ? 'profile-status-checkmark-abled' : 'desktop-profile-status-checkmark-abled'"/>
                            <span class="profile-status-private-option-icon"
                                  :style="(is_mobile) ? '' : 'margin-left: 50px;margin-top: 0px;height: 35px;width: 35px;'"/>
                            <span class="profile-status-checkmark-text">Only Me</span>
                        </div>
                    </div>
                </div>
            </transition>

            <div class="total-watched-container">
                <span  style="font-weight: bold;font-size: 15px;">
                    {{(own_profile) ? 'You have': user_name.split(' ')[0]+' has'}} watched...
                </span>

                <div :class="(is_mobile) ? 'total-watched' : 'desktop-total-watched'">
                    {{total_watched[content_type].total}}

                    <span v-if="content_type=='movie'">
                        Movies
                    </span>
                    <span v-if="content_type=='tv'">
                        TV Series
                    </span>
                </div>
                <div :class="(is_mobile) ? 'total-watched-time' : 'desktop-total-watched-time'">
                    taking {{total_watched[content_type].time}}
                </div>
            </div>

            <div class="profile-ratings"
                v-if="filtered_ratings(3).length
                    |
                    filtered_ratings(2).length
                    |
                    filtered_ratings(1).length">
                <span style="font-weight: bold;font-size: 15px;">
                    {{(own_profile) ? 'Your': user_name.split(' ')[0]+"'s"}} ratings...
                </span>
                <span class="reset-ratings"
                        v-if="own_profile"
                        @click="reset_ratings_banner=!reset_ratings_banner">
                    Reset Ratings
                </span>

                <div style="display:flex;"
                    v-if="filtered_ratings(3).length">
                    <div class="profile-love-true"
                        :style="(is_mobile) ? 'position: relative;margin-left: 0px;margin-top: 80px;background-color: #ffffff;' : 'position: relative;width: 40px;height: 40px;margin-left: 0px;margin-top: 110px;background-color: #ffffff;'"/>

                    <div :class="(is_mobile) ? 'ratings-container' : 'desktop-ratings-container'">
                        <div v-for="item, index in contents_rated"
                            v-if="(item.type == content_type) && ([3].includes(item.rating))"
                            class="ratings-item-container">

                            <img v-bind:src="item.poster"
                                :style="(own_profile != true) ? 'border-bottom-left-radius: 7px;border-bottom-right-radius: 7px;' : ''"
                                :class="(is_mobile) ? 'ratings-item-poster' : 'desktop-ratings-item-poster'"
                                @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self_' : 'other_')+'ratings')"/>

                            <div v-if="own_profile"
                                    :class="(is_mobile) ? 'profile-user-rating-container' : 'desktop-profile-user-rating-container'">
                                <button v-bind:class="[ (item.rating == 2) ? 'profile-thumbs-up-true' : 'profile-thumbs-up-false' ]"
                                        @click="submitRating(item.content_id, ((item.rating == 2) ? 0 : 2), index)">
                                </button>

                                <button v-bind:class="[ (item.rating == 1) ? 'profile-thumbs-down-true' : 'profile-thumbs-down-false' ]"
                                        :style="(is_mobile) ? '' : 'margin-left: 33px;'"
                                        @click="submitRating(item.content_id, ((item.rating == 1) ? 0 : 1), index)">
                                </button>

                                <button v-bind:class="[ (item.rating == 3) ? 'profile-love-true' : 'profile-love-false' ]"
                                        @click="submitRating(item.content_id, ((item.rating == 3) ? 0 : 3), index)">
                                </button>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true) && (Object.keys(item.where_to_watch || {}).includes('stream'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.stream">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('rent'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.rent">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('rent'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('buy'))"
                                        >
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.buy">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display:flex;"
                    v-if="filtered_ratings(2).length">
                    <div class="profile-thumbs-up-true"
                        :style="(is_mobile) ? 'position: relative;margin-left: 0px;margin-top: 80px;background-color: #ffffff;' : 'position: relative;width: 40px;height: 40px;margin-left: 0px;margin-top: 110px;background-color: #ffffff;'"/>

                    <div :class="(is_mobile) ? 'ratings-container' : 'desktop-ratings-container'">
                        <div class="ratings-item-container"
                            v-for="item, index in contents_rated"
                            v-if="(item.type == content_type) && ([2].includes(item.rating))">

                            <img v-bind:src="item.poster"
                                :style="(own_profile != true) ? 'border-bottom-left-radius: 7px;border-bottom-right-radius: 7px;' : ''"
                                :class="(is_mobile) ? 'ratings-item-poster' : 'desktop-ratings-item-poster'"
                                @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self_' : 'other_')+'ratings')"/>

                            <div v-if="own_profile"
                                    :class="(is_mobile) ? 'profile-user-rating-container' : 'desktop-profile-user-rating-container'">
                                <button v-bind:class="[ (item.rating == 2) ? 'profile-thumbs-up-true' : 'profile-thumbs-up-false' ]"
                                        @click="submitRating(item.content_id, ((item.rating == 2) ? 0 : 2), index)">
                                </button>

                                <button v-bind:class="[ (item.rating == 1) ? 'profile-thumbs-down-true' : 'profile-thumbs-down-false' ]"
                                        :style="(is_mobile) ? '' : 'margin-left: 33px;'"
                                        @click="submitRating(item.content_id, ((item.rating == 1) ? 0 : 1), index)">
                                </button>

                                <button v-bind:class="[ (item.rating == 3) ? 'profile-love-true' : 'profile-love-false' ]"
                                        @click="submitRating(item.content_id, ((item.rating == 3) ? 0 : 3), index)">
                                </button>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true) && (Object.keys(item.where_to_watch || {}).includes('stream'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.stream">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('rent'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.rent">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('rent'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('buy'))"
                                        >
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.buy">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div style="display:flex;"
                    v-if="filtered_ratings(1).length">
                    <div class="profile-thumbs-down-true"
                        :style="(is_mobile) ? 'position: relative;margin-left: 0px;margin-top: 80px;background-color: #ffffff;' : 'position: relative;width: 40px;height: 40px;margin-left: 0px;margin-top: 110px;background-color: #ffffff;'"/>

                    <div :class="(is_mobile) ? 'ratings-container' : 'desktop-ratings-container'">
                        <div v-for="item, index in contents_rated"
                            v-if="(item.type == content_type) && ([1].includes(item.rating))"
                            class="ratings-item-container">

                            <img v-bind:src="item.poster"
                                :style="(own_profile != true) ? 'border-bottom-left-radius: 7px;border-bottom-right-radius: 7px;' : ''"
                                :class="(is_mobile) ? 'ratings-item-poster' : 'desktop-ratings-item-poster'"
                                @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self_' : 'other_')+'ratings')"/>

                            <div v-if="own_profile"
                                    :class="(is_mobile) ? 'profile-user-rating-container' : 'desktop-profile-user-rating-container'">
                                <button v-bind:class="[ (item.rating == 2) ? 'profile-thumbs-up-true' : 'profile-thumbs-up-false' ]"
                                        @click="submitRating(item.content_id, ((item.rating == 2) ? 0 : 2), index)">
                                </button>

                                <button v-bind:class="[ (item.rating == 1) ? 'profile-thumbs-down-true' : 'profile-thumbs-down-false' ]"
                                        :style="(is_mobile) ? '' : 'margin-left: 33px;'"
                                        @click="submitRating(item.content_id, ((item.rating == 1) ? 0 : 1), index)">
                                </button>

                                <button v-bind:class="[ (item.rating == 3) ? 'profile-love-true' : 'profile-love-false' ]"
                                        @click="submitRating(item.content_id, ((item.rating == 3) ? 0 : 3), index)">
                                </button>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true) && (Object.keys(item.where_to_watch || {}).includes('stream'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.stream">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('rent'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.rent">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('rent'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('buy'))"
                                        >
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.buy">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'ratings')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
                <div>
                    <div v-if="reset_ratings_banner && own_profile"
                        class="black-background"
                        @click="reset_ratings_banner=false"/>

                    <div class="prompted-box"
                        v-if="reset_ratings_banner && own_profile">

                        <p style="margin-top: 0;font-size: 20px;white-space: nowrap;">
                            Reset all your ratings?
                        </p>

                        <div class="profile-prompted-buttons">
                            <div class="prompted-cancel-button"
                                    @click="reset_ratings_banner=false">
                                Cancel
                            </div>
                            <div class="prompted-confirm-button"
                                    @click="resetRatings">
                                Reset
                            </div>
                        </div>
                    </div>
                </div>

            </transition>

            <transition appear
                enter-active-class="animated fadeIn"
                leave-active-class="animated fadeOut">
                <div>
                    <div v-if="share_profile_banner && own_profile"
                        class="black-background"
                        @click="share_profile_banner=false"/>

                    <div class="prompted-box"
                         :style="(collage) ? (is_mobile ? 'top: 20vh;min-width: 75vw;' : 'top: 20vh;min-width: 25vw;') : ''"
                        v-if="share_profile_banner && own_profile">

                        <img :src="collage +'?' + new Date().getTime()"
                             v-if="collage"
                             style="max-width: 80vw;max-height: 45vh;">

                        <div class="sk-folding-cube"
                             v-if="!collage">
                            <div class="sk-cube1 sk-cube"></div>
                            <div class="sk-cube2 sk-cube"></div>
                            <div class="sk-cube4 sk-cube"></div>
                            <div class="sk-cube3 sk-cube"></div>
                        </div>

                        <span v-if="!collage"
                           style="margin-top: 0px; width:60vw; font-size:16px;">
                            Preparing collage for your taste...
                            <p style="font-size:10px;"
                               v-if="profile_status!='public'">
                                Your profile will become public
                            </p>
                        </span>

                        <div class="profile-prompted-buttons"
                             v-if="collage">
                            <div class="prompted-cancel-button"
                                    @click="refreshCollage">
                                Try Another
                            </div>

                            <input type="button"
                                   class="prompted-android-share-button"
                                   @click="promptAndroidShareIntent"
                                   value="Share">

                            <a v-if="collage && !store.is_webview"
                               :href="collage+'?'+new Date().getTime()"
                               download="flibo-collage.jpg"
                               class="collage-download-button"/>
                        </div>

                        <p style="position: relative;font-size: 10px;margin-top: 55px;"
                            v-if="collage && !store.is_webview">
                            Profile URL copied, paste while posting
                        </p>
                    </div>
                </div>

            </transition>

            <div v-if="filtered_watchlist().length"
                style="width: 100%;text-align: left;padding: 7px;">
                <span style="font-weight: bold;font-size: 15px;">
                    {{(own_profile) ? 'Your': user_name.split(' ')[0]+"'s"}} watchlist...
                </span>

                <div :class="(is_mobile) ? 'ratings-container' : 'desktop-ratings-container'"
                    style="margin-left: 0;width: 100%;">
                    <div v-for="item, index in watchlist"
                        v-if="item.type == content_type"
                        class="ratings-item-container">

                        <img v-bind:src="item.poster"
                            :style="(own_profile != true) ? 'border-bottom-left-radius: 7px;border-bottom-right-radius: 7px;' : ''"
                            :class="(is_mobile) ? 'ratings-item-poster' : 'desktop-ratings-item-poster'"
                            @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self_' : 'other_')+'watchlist')"/>

                        <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true) && (Object.keys(item.where_to_watch || {}).includes('stream'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.stream">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'watchlist')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('rent'))">
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.rent">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'watchlist')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-platforms"
                                :style="(is_mobile) ? '' : 'width: 150px;margin-top: -42px;'"
                                v-if="(own_profile!=true)
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                        &&
                                        (!Object.keys(item.where_to_watch || {}).includes('rent'))
                                        &&
                                        (Object.keys(item.where_to_watch || {}).includes('buy'))"
                                        >
                                <div class="profile-platforms-container"
                                    v-for="stream_item, stream_index in item.where_to_watch.buy">
                                    <div @click="goToProfilePlatform(stream_item, item.content_id, 'watchlist')"
                                        class="profile-platform-cropper"
                                        :style="(is_mobile) ? '' : 'width: 28px;height: 28px;'">
                                        <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                            class="profile-platform-icon"/>
                                    </div>
                                </div>
                            </div>
                    </div>
                </div>
            </div>

            <div :style="(is_mobile) ? 'position: relative;font-weight: bold;font-size: 15px;white-space: nowrap;text-align: left;margin-left: 7px;' : 'position: relative;font-weight: bold;font-size: 15px;white-space: nowrap;text-align: left;margin-left: 7px;margin-top: 15px;'"
                v-if="friends.length">
                {{(own_profile) ? 'Your': user_name.split(' ')[0]+"'s"}} connections...
            </div>

            <div class="profile-friends-box"
                 :style="(is_mobile) ? '' : 'margin-bottom: 0px;'"
                 v-if="friends.length">
                <div v-for="item, index in friends"
                    class="profile-friend-container">

                    <div class="profile-friend-pp-cropper"
                         :style="(is_mobile) ? '' : 'width: 90px;height: 90px;'"
                         @click="clickUser(item.id, item.name)">
                        <img v-bind:src="item.picture"
                                onerror="this.onerror=null;this.src='https://flibo-images.s3-us-west-2.amazonaws.com/profile_pictures/avatar.png';"
                                class="profile-friend-pp">
                    </div>

                    <h5 class="profile-friend-name"
                        :style="(is_mobile) ? '' : 'width: 90px;'"
                        @click="clickUser(item.id, item.name)">
                        {{item.name.toLowerCase()}}
                    </h5>
                </div>
            </div>

            <div :class="(is_mobile) ? 'fav-artists-container' : 'desktop-fav-artists-container'"
                 v-if="favorite_artists[content_type].directed_by
                        ||
                        favorite_artists[content_type].cast
                        ||
                        favorite_artists[content_type].writing_credits">
                <span  style="width: 100%;font-weight: bold;font-size: 15px;margin-left: -7px;">
                    {{(own_profile) ? 'Your': user_name.split(' ')[0]+"'s"}} favorite artists are...
                </span>
                <div :class="(is_mobile) ? 'fav-artist-category' : 'desktop-fav-artist-category'"
                    v-if="favorite_artists[content_type].directed_by">
                    Director
                </div>
                <div class="fav-artists" v-if="favorite_artists[content_type].directed_by">
                    <div v-for="artist in favorite_artists[content_type].directed_by"
                        class="fav-catg-artists-container"
                        @click="moreContent(artist.person_id, artist.name, 'directed_by')">
                    <div :class="(is_mobile) ? 'fav-artist-cropper' : 'desktop-fav-artist-cropper'">
                        <img v-bind:src="artist.picture" class="fav-artist-pic">
                    </div>
                    <div :class="(is_mobile) ? 'fav-artist-name' : 'desktop-fav-artist-name'">
                        {{artist.name}}
                    </div>
                    </div>
                </div>

                <div :class="(is_mobile) ? 'fav-artist-category' : 'desktop-fav-artist-category'"
                     v-if="favorite_artists[content_type].cast">
                    Actor
                </div>
                <div class="fav-artists" v-if="favorite_artists[content_type].cast">
                    <div v-for="artist in favorite_artists[content_type].cast"
                        class="fav-catg-artists-container"
                        @click="moreContent(artist.person_id, artist.name, 'cast')">
                        <div :class="(is_mobile) ? 'fav-artist-cropper' : 'desktop-fav-artist-cropper'">
                            <img v-bind:src="artist.picture" class="fav-artist-pic">
                        </div>
                        <div :class="(is_mobile) ? 'fav-artist-name' : 'desktop-fav-artist-name'">
                            {{artist.name}}
                        </div>
                    </div>
                    </div>

                <div :class="(is_mobile) ? 'fav-artist-category' : 'desktop-fav-artist-category'"
                     v-if="favorite_artists[content_type].writing_credits">
                    Writer
                </div>
                <div class="fav-artists" v-if="favorite_artists[content_type].writing_credits">
                    <div v-for="artist in favorite_artists[content_type].writing_credits"
                        class="fav-catg-artists-container"
                        @click="moreContent(artist.person_id, artist.name, 'writing_credits')">
                        <div :class="(is_mobile) ? 'fav-artist-cropper' : 'desktop-fav-artist-cropper'">
                            <img v-bind:src="artist.picture" class="fav-artist-pic">
                        </div>
                        <div :class="(is_mobile) ? 'fav-artist-name' : 'desktop-fav-artist-name'">
                            {{artist.name}}
                        </div>
                    </div>
                </div>

            </div>

            <div v-if="genres[content_type].genre.length"
                    class="genres-container">
                    {{(own_profile) ? 'Your': user_name.split(' ')[0]+"'s"}} favorite genres...
                <GenresPie :class="(is_mobile) ? 'genres-pie' : 'desktop-genres-pie'"
                            :genres="genres[content_type].genre"
                            :contribution="genres[content_type].contribution"
                            :parent_content_type="content_type"/>
            </div>

            <div v-if="watched_timeline[content_type].years.length"
                    class="watched-timeline-container">
                    <div>A timeline of {{(own_profile) ? 'your': user_name.split(' ')[0]+"'s"}} taste...</div>
                <WatchedTimeline :class="(is_mobile) ? 'watched-timeline' : 'desktop-watched-timeline'"
                                    :years="watched_timeline[content_type].years"
                                    :liked="watched_timeline[content_type].liked"
                                    :disliked="watched_timeline[content_type].disliked"
                                    :loved="watched_timeline[content_type].loved"
                                    :total="watched_timeline[content_type].total"
                                    :parent_content_type="content_type"/>
            </div>

            <div class="fav-artists-more-contents-container" v-if="more_by_artist.length | fetching_content_by_artist">
                <div :style="(is_mobile) ? more_header_negative : desktop_more_header_negative"
                     v-on-click-outside="close"
                     v-if="fetching_content_by_artist">
                    Fetching content by {{artist.split(' ')[0]}}...
                </div>
                <div :style="(is_mobile) ? close_more_header_negative : desktop_close_more_header_negative" v-if="fetching_content_by_artist"
                     @click="close"/>

                <div :style="(is_mobile) ? more_header_positive : desktop_more_header_positive" v-if="more_by_artist.length">
                    &#160&#160Content by {{artist.split(' ')[0]}}...
                </div>
                <div :style="(is_mobile) ? close_more_header_positive : desktop_close_more_header_positive" v-if="more_by_artist.length"
                     @click="close"/>

                <div :style="(is_mobile) ? more_contents : desktop_more_contents"
                     v-if="more_by_artist.length"
                     v-on-click-outside="close">
                    <div v-for="item in more_by_artist"
                         :class="(is_mobile) ? 'fav-artists-content-container' : 'desktop-fav-artists-content-container'">
                        <img v-bind:src="item.poster"
                             @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self__' : 'other__')+'more_by_artist')"
                             :class="(is_mobile) ? 'fav-artists-content-poster' : 'desktop-fav-artists-content-poster'">

                        <div class="profile-by-artist-platforms"
                            :style="(is_mobile) ? null : 'width: 125px;margin-top: -37px;padding: 5.5px 0px;'"
                            v-if="(Object.keys(item.where_to_watch || {}).includes('stream'))">
                            <div class="profile-by-artist-platforms-container"
                                v-for="stream_item, stream_index in item.where_to_watch.stream">
                                <div @click="goToProfilePlatform(stream_item, item.content_id, 'more_by_artist')"
                                    class="profile-by-artist-platform-cropper"
                                    :style="(is_mobile) ? '' : 'width: 23px;height: 23px;'">
                                    <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                        class="profile-by-artist-platform-icon"/>
                                </div>
                            </div>
                        </div>

                        <div class="profile-by-artist-platforms"
                            :style="(!is_mobile) ? null : 'width: 125px;margin-top: -37px;padding: 5.5px 0px;'"
                            v-if="(own_profile!=true)
                                    &&
                                    (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                    &&
                                    (Object.keys(item.where_to_watch || {}).includes('rent'))">
                            <div class="profile-by-artist-platforms-container"
                                v-for="stream_item, stream_index in item.where_to_watch.rent">
                                <div @click="goToProfilePlatform(stream_item, item.content_id, 'more_by_artist')"
                                    class="profile-by-artist-platform-cropper"
                                    :style="(is_mobile) ? '' : 'width: 23px;height: 23px;'">
                                    <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                        class="profile-by-artist-platform-icon"/>
                                </div>
                            </div>
                        </div>

                        <div class="profile-by-artist-platforms"
                            :style="(!is_mobile) ? null : 'width: 125px;margin-top: -37px;padding: 5.5px 0px;'"
                            v-if="(own_profile!=true)
                                    &&
                                    (!Object.keys(item.where_to_watch || {}).includes('stream'))
                                    &&
                                    (!Object.keys(item.where_to_watch || {}).includes('rent'))
                                    &&
                                    (Object.keys(item.where_to_watch || {}).includes('buy'))"
                                    >
                            <div class="profile-by-artist-platforms-container"
                                v-for="stream_item, stream_index in item.where_to_watch.buy">
                                <div @click="goToProfilePlatform(stream_item, item.content_id, 'more_by_artist')"
                                    class="profile-by-artist-platform-cropper"
                                    :style="(is_mobile) ? '' : 'width: 23px;height: 23px;'">
                                    <img v-bind:src="'https://flibo-images.s3-us-west-2.amazonaws.com/logos/platforms/'+stream_index+'.jpg'"
                                        class="profile-by-artist-platform-icon"/>
                                </div>
                            </div>
                        </div>

                        <div class="fav-artists-content-name"
                             @click="openContent(item.content_id, item.title, 'profile_'+(own_profile ? 'self__' : 'other__')+'more_by_artist')"
                             :style="(is_mobile) ? '' : 'width: 125px;'">
                            {{item.title}}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import SearchBar from "./SearchBar";
import GenresPie from "./GenresPie";
import WatchedTimeline from "./WatchedTimeline";
import { mixin as onClickOutside } from "vue-on-click-outside";

export default {
  name: "App",
  mixins: [onClickOutside],
  components: {
    SearchBar,
    GenresPie,
    WatchedTimeline
  },
  data() {
    return {
      is_mobile: window.screen.height > window.screen.width,
      renderComponent: true,
      content_type: "movie",
      fetching_profile: false,
      user_type: null,
      user_id: null,
      user_name: null,
      profile_picture: null,
      own_profile: null,
      tab_name: "Ratings",
      rating_tab: [3],
      posters: [],
      covers: [],
      profile_status: "",
      update_profile_status: false,
      profile_views: 0,
      profile_vies_desc: false,
      add_content: false,
      movies_these_days: [],
      tv_series_these_days: [],
      total_watched: {
        movie: {
          total: "some great",
          time: "some good time :)"
        },
        tv: {
          total: "some great",
          time: "some good time :)"
        }
      },
      seeking_recommendations: false,
      store: this.$store.state,
      favorite_artists: {
        movie: {},
        tv: {}
      },
      more_by_artist: [],
      artist: null,
      contents_rated: [],
      watchlist: [],
      friends: [],
      genres: {
        movie: {
          genre: [],
          contribution: []
        },
        tv: {
          genre: [],
          contribution: []
        }
      },
      watched_timeline: {
        movie: {
          years: [],
          liked: [],
          disliked: [],
          loved: [],
          total: []
        },
        tv: {
          years: [],
          liked: [],
          disliked: [],
          loved: [],
          total: []
        }
      },
      remove_friend_banner: false,
      cancel_request_banner: false,
      reset_ratings_banner: false,
      share_profile_banner: false,
      prompt: false,
      fetching_content_by_artist: false,
      openProfileMore: false,
      collage: null
    };
  },
  created() {
    window.scrollTo(0, 0);
    this.$store.state.current_path = this.$route.path;
    var userid = this.$route.params.user_id;
    var username = this.$route.params.user_name;
    var self = this;
    self.fetching_profile = true;
    if (self.store.user.id == userid) {
      self.own_profile = true;
      self.user_type = "self";
      self.user_id = self.store.user.id;
      self.user_name = self.store.user.name;
      self.profile_picture = self.store.user.picture;
      self.posters = self.store.user.profile.posters;
      self.covers = self.store.user.profile.covers;
      self.total_watched = self.store.user.profile.total_watched;
      self.contents_rated = self.store.user.profile.contents_rated;
      self.genres = self.store.user.profile.genres;
      self.watched_timeline = self.store.user.profile.watched_timeline;
      self.profile_status = self.store.user.profile.profile_status;
      self.profile_views = self.store.user.profile.profile_views;
    } else {
      self.own_profile = false;
    }

    if (
      this.store.user.profile.country == null &&
      this.store.guest_country == null
    ) {
      axios
        .get("https://ipinfo.io/?token=a354c067e1fef5")
        .then(function(response) {
          if ([200].includes(response.status)) {
            var country_code = response.data.country;
            if (
              Object.keys(self.$store.state.country_mappings).includes(
                country_code
              )
            ) {
              self.store.guest_country =
                self.$store.state.country_mappings[response.data.country];
            }
          }

          axios
            .post(self.$store.state.api_host + "profile", {
              session_id: self.$store.state.session_id,
              user_id: parseInt(userid),
              user_name: username,
              country: self.store.guest_country,
              guest_id: self.$store.state.guest_id
            })
            .then(function(response) {
              if ([200].includes(response.status)) {
                self.user_type = response.data.user_type;
                self.user_id = response.data.user_id;
                self.user_name = response.data.user_name;
                self.profile_picture = response.data.profile_picture;
                self.posters = response.data.profile_cover.posters;
                self.covers = response.data.profile_cover.covers;
                self.total_watched = response.data.total_watched;
                self.contents_rated = response.data.contents_rated;
                self.watchlist = response.data.watchlist;
                self.friends = response.data.friends;
                self.genres = response.data.genres;
                self.watched_timeline = response.data.rating_timeline;
                self.profile_status = response.data.profile_status;
                self.profile_views = response.data.profile_views;
                if (self.store.user.id == self.user_id) {
                  self.own_profile = true;
                } else {
                  self.own_profile = false;
                }
                if (self.own_profile) {
                  self.store.user.profile.posters =
                    response.data.profile_cover.posters;
                  self.store.user.profile.covers =
                    response.data.profile_cover.covers;
                  self.store.user.profile.total_watched =
                    response.data.total_watched;
                  self.store.user.profile.contents_rated =
                    response.data.contents_rated;
                  self.store.user.profile.genres = response.data.genres;
                  self.store.user.profile.watched_timeline =
                    response.data.rating_timeline;
                  self.store.user.profile.profile_status =
                    response.data.profile_status;
                  self.store.user.profile.profile_views =
                    response.data.profile_views;
                }
              } else {
                // console.log(response.status);
              }
              self.fetching_profile = false;
            })
            .catch(function(error) {
              self.fetching_profile = false;
              // console.log(error);
              if ([401, 419].includes(error.response.status)) {
                window.location =
                  self.$store.state.login_host +
                  "logout?session_id=" +
                  self.$store.state.session_id;
                self.$store.state.session_id = null;
                self.$emit("logging-out");
              } else {
                // console.log(error.response.status);
              }
            });
        });
    } else {
      axios
        .post(self.$store.state.api_host + "profile", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.user_type = response.data.user_type;
            self.user_id = response.data.user_id;
            self.user_name = response.data.user_name;
            self.profile_picture = response.data.profile_picture;
            self.posters = response.data.profile_cover.posters;
            self.covers = response.data.profile_cover.covers;
            self.total_watched = response.data.total_watched;
            self.contents_rated = response.data.contents_rated;
            self.watchlist = response.data.watchlist;
            self.friends = response.data.friends;
            self.genres = response.data.genres;
            self.watched_timeline = response.data.rating_timeline;
            self.profile_status = response.data.profile_status;
            self.profile_views = response.data.profile_views;
            if (self.store.user.id == self.user_id) {
              self.own_profile = true;
            } else {
              self.own_profile = false;
            }
            if (self.own_profile) {
              self.store.user.profile.posters =
                response.data.profile_cover.posters;
              self.store.user.profile.covers =
                response.data.profile_cover.covers;
              self.store.user.profile.total_watched =
                response.data.total_watched;
              self.store.user.profile.contents_rated =
                response.data.contents_rated;
              self.store.user.profile.genres = response.data.genres;
              self.store.user.profile.watched_timeline =
                response.data.rating_timeline;
              self.store.user.profile.profile_status =
                response.data.profile_status;
              self.store.user.profile.profile_views =
                response.data.profile_views;
            }
          } else {
            // console.log(response.status);
          }
          self.fetching_profile = false;
        })
        .catch(function(error) {
          self.fetching_profile = false;
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    }

    axios
      .post(self.$store.state.api_host + "favorite_artists", {
        session_id: self.$store.state.session_id,
        user_id: parseInt(userid),
        user_name: username
      })
      .then(function(response) {
        if ([200].includes(response.status)) {
          self.favorite_artists = response.data.favorite_artists;
        } else {
          // console.log(response.status);
        }
      })
      .catch(function(error) {
        // console.log(error);
        if ([401, 419].includes(error.response.status)) {
          window.location =
            self.$store.state.login_host +
            "logout?session_id=" +
            self.$store.state.session_id;
          self.$store.state.session_id = null;
          self.$emit("logging-out");
        } else {
          // console.log(error.response.status);
        }
      });
  },
  methods: {
    goToProfilePlatform(link, content_id, traffic_origin) {
      var activity = {
        api: "outbound_traffic",
        content_id: content_id,
        url: link,
        traffic_origin:
          (this.own_profile ? "self_" : "other_") + "profile__" + traffic_origin
      };
      this.$emit("update-api-counter", activity);
    },
    promptShareProfile() {
      this.collage = null;
      this.share_profile_banner = true;

      var dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.value = window.location.href;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);

      this.refreshCollage();
    },
    refreshCollage() {
      this.$emit("update-api-counter", { api: "refresh_collage" });
      this.collage = null;
      var self = this;
      axios
        .post(self.$store.state.api_host + "collage", {
          session_id: self.$store.state.session_id
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.collage = response.data.collage;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    copyProfileUrl() {
      this.updateProfileStatus("public");
      var dummy = document.createElement("input");
      document.body.appendChild(dummy);
      dummy.value = window.location.href;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      this.share_profile_banner = false;
    },
    promptAndroidShareIntent() {
      this.$emit("update-api-counter", { api: "share_profile" });
      this.updateProfileStatus("public");

      if (this.store.is_webview) {
        Android.shareCollage(this.collage, window.location.href);
      } else {
        this.share_profile_banner = false;
        window.open(
          "http://www.facebook.com/sharer.php?u=" +
            encodeURIComponent(this.collage + "?" + new Date().getTime()) +
            "&quote=Checkout my profile, hope you find something great to watch:)",
          "sharer",
          "toolbar=0,status=0,width=626,height=436"
        );
      }
    },
    reRender() {
      window.scrollTo(0, 0);
      this.$store.state.current_path = this.$route.path;
      var userid = this.$route.params.user_id;
      var username = this.$route.params.user_name;
      var self = this;
      self.fetching_profile = true;
      if (self.store.user.id == userid) {
        self.own_profile = true;
        self.user_type = "self";
        self.user_id = self.store.user.id;
        self.user_name = self.store.user.name;
        self.profile_picture = self.store.user.picture;
        self.posters = self.store.user.profile.posters;
        self.covers = self.store.user.profile.covers;
        self.total_watched = self.store.user.profile.total_watched;
        self.contents_rated = self.store.user.profile.contents_rated;
        self.genres = self.store.user.profile.genres;
        self.watched_timeline = self.store.user.profile.watched_timeline;
        self.profile_status = self.store.user.profile.profile_status;
        self.profile_views = self.store.user.profile.profile_views;
      } else {
        self.own_profile = false;
      }
      axios
        .post(self.$store.state.api_host + "profile", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username,
          country:
            self.$store.state.user.profile.country || self.store.guest_country,
          guest_id: self.$store.state.guest_id
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.user_type = response.data.user_type;
            self.user_id = response.data.user_id;
            self.user_name = response.data.user_name;
            self.profile_picture = response.data.profile_picture;
            self.posters = response.data.profile_cover.posters;
            self.covers = response.data.profile_cover.covers;
            self.total_watched = response.data.total_watched;
            self.contents_rated = response.data.contents_rated;
            self.watchlist = response.data.watchlist;
            self.friends = response.data.friends;
            self.genres = response.data.genres;
            self.watched_timeline = response.data.rating_timeline;
            self.profile_status = response.data.profile_status;
            self.profile_views = response.data.profile_views;
            if (self.store.user.id == self.user_id) {
              self.own_profile = true;
            } else {
              self.own_profile = false;
            }
            if (self.own_profile) {
              self.store.user.profile.posters =
                response.data.profile_cover.posters;
              self.store.user.profile.covers =
                response.data.profile_cover.covers;
              self.store.user.profile.total_watched =
                response.data.total_watched;
              self.store.user.profile.contents_rated =
                response.data.contents_rated;
              self.store.user.profile.genres = response.data.genres;
              self.store.user.profile.watched_timeline =
                response.data.rating_timeline;
              self.store.user.profile.profile_status =
                response.data.profile_status;
              self.store.user.profile.profile_views =
                response.data.profile_views;
            }
          } else {
            // console.log(response.status);
          }
          self.fetching_profile = false;
        })
        .catch(function(error) {
          self.fetching_profile = false;
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });

      axios
        .post(self.$store.state.api_host + "favorite_artists", {
          session_id: self.$store.state.session_id,
          user_id: parseInt(userid),
          user_name: username
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.favorite_artists = response.data.favorite_artists;
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    filtered_ratings(rating) {
      var filtered = [];
      var item;
      for (item in this.contents_rated) {
        if (
          (this.contents_rated[item].rating == rating) &
          (this.contents_rated[item].type == this.content_type)
        ) {
          filtered.push(this.contents_rated[item]);
        }
      }
      return filtered;
    },
    filtered_watchlist() {
      var filtered = [];
      var item;
      for (item in this.watchlist) {
        if (this.watchlist[item].type == this.content_type) {
          filtered.push(this.watchlist[item]);
        }
      }
      return filtered;
    },
    goToAboutUs() {
      this.$router.push("/about-us");
      this.$emit("update-api-counter", { api: "about_us" });
    },
    logOut() {
      window.location =
        this.$store.state.login_host +
        "logout?session_id=" +
        this.$store.state.session_id;
      this.$store.state.session_id = null;
      this.$emit("logging-out");
    },
    goToFriends() {
      this.$router.push("/connections");
      this.$emit("update-api-counter", { api: "connections" });
    },
    switchProfileContentType() {
      if (this.$store.state.notifications.never_seen_profile_switch) {
        this.$store.state.notifications.never_seen_profile_switch = false;
      }
      this.content_type = this.content_type == "movie" ? "tv" : "movie";
      window.scrollTo(0, 0);
    },
    openContent(content_id, title, origin) {
      this.$store.state.content_page.more_by_artist = null;
      this.$store.state.content_page.artist = null;
      this.$store.state.content_page.origin = origin;
      this.$router.push(
        "/content/" +
          content_id +
          "/" +
          title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    updateProfile() {
      var self = this;
      var movies = [];
      var tv_series = [];
      var index;
      for (index in self.movies_these_days) {
        movies.push(self.movies_these_days[index].subject_id);
      }
      for (index in self.tv_series_these_days) {
        tv_series.push(self.tv_series_these_days[index].subject_id);
      }
      axios
        .post(self.$store.state.api_host + "update_profile", {
          session_id: self.$store.state.session_id,
          movies_these_days: movies,
          tv_series_these_days: tv_series,
          seeking_recommendations: self.seeking_recommendations,
          profile_status: self.profile_status
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    addContent(content) {
      var movies = [];
      var tv_series = [];
      var index;
      for (index in this.movies_these_days) {
        movies.push(this.movies_these_days[index].subject_id);
      }
      for (index in this.tv_series_these_days) {
        tv_series.push(this.tv_series_these_days[index].subject_id);
      }
      if (this.content_type == "movie" && /^[1]/.test(content.subject_id)) {
        var index = movies.indexOf(content.subject_id);
        // console.log(index);
        if (index == -1) {
          this.movies_these_days.push(content);
        }
      } else if (this.content_type == "tv" && /^[2]/.test(content.subject_id)) {
        var index = tv_series.indexOf(content.subject_id);
        // console.log(index);
        if (index == -1) {
          this.tv_series_these_days.push(content);
        }
      }
      this.add_content = false;
      this.updateProfile();
    },
    removeCard(index) {
      if (this.content_type == "movie") {
        this.movies_these_days.splice(index, 1);
      } else {
        this.tv_series_these_days.splice(index, 1);
      }
      this.updateProfile();
    },
    moreContent(artist_id, artist_name, credit_category) {
      this.fetching_content_by_artist = true;
      this.artist = artist_name;
      this.$store.state.click_coordinate_x = event.clientX;
      this.$store.state.click_coordinate_y = event.clientY;
      var self = this;
      axios
        .post(this.$store.state.api_host + "more_by_artist", {
          session_id: this.$store.state.session_id,
          artist_id: artist_id,
          credit_category: credit_category,
          country:
            self.$store.state.user.profile.country ||
            self.$store.state.guest_country,
          guest_id: self.$store.state.guest_id
        })
        .then(
          response => (
            (self.more_by_artist = response.data.contents),
            (self.fetching_content_by_artist = false)
          )
        )
        .catch(function(error) {
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    close() {
      this.more_by_artist = [];
      this.artist = null;
    },
    submitRating(content_id, user_rating, content_index) {
      var self = this;
      var prev_rating = self.contents_rated[content_index].rating;
      self.contents_rated[content_index].rating = user_rating;
      axios
        .post(this.$store.state.api_host + "submit_rating", {
          session_id: this.$store.state.session_id,
          content_ids: [content_id],
          rating: user_rating
        })
        .then(function(response) {
          var index = self.$store.state.suggestions.rate_counter.indexOf(
            content_id
          );
          if (index == -1) {
            self.$store.state.suggestions.rate_counter.push(content_id);
            if (
              self.$store.state.suggestions.rate_counter.length ==
              self.$store.state.suggestions.calc_after
            ) {
              self.$store.state.suggestions.rate_counter = [];
              axios
                .post(
                  self.$store.state.ai_host + "calculate_contents_to_recommend",
                  {
                    session_id: self.$store.state.session_id
                  }
                )
                .then(function(response) {
                  self.$store.state.suggestions.refresh_recommendation = true;
                  self.$store.state.suggestions.notify = true;
                });
            }
          }
        })
        .catch(function(error) {
          self.contents_rated[content_index].rating = prev_rating;
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    updateProfileStatus(profile_status) {
      this.profile_status = profile_status;
      this.updateProfile();
      this.update_profile_status = false;
    },
    hideBanner() {
      var self = this;
      setTimeout(function() {
        self.remove_friend_banner = false;
        self.cancel_request_banner = false;
        self.reset_ratings_banner = false;
      }, 100);
    },
    unfriend(current_status) {
      var self = this;
      self.user_type = "other";
      self.prompt = false;
      axios
        .post(self.$store.state.api_host + "unfriend", {
          session_id: self.$store.state.session_id,
          friend_id: self.user_id
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.remove_friend_banner = false;
            self.cancel_request_banner = false;
            if (current_status == "friend") {
              location.reload();
            }
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          self.user_type = current_status;
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    sendRequest() {
      if (this.$store.state.session_id != null) {
        var self = this;
        self.user_type = "request_sent";
        axios
          .post(self.$store.state.api_host + "send_request", {
            session_id: self.$store.state.session_id,
            friend_id: self.user_id
          })
          .then(function(response) {
            if ([200].includes(response.status)) {
              self.remove_friend_banner = false;
            } else {
              // console.log(response.status);
            }
          })
          .catch(function(error) {
            self.user_type = "other";
            // console.log(error);
            if ([401, 419].includes(error.response.status)) {
              window.location =
                self.$store.state.login_host +
                "logout?session_id=" +
                self.$store.state.session_id;
              self.$store.state.session_id = null;
              self.$emit("logging-out");
            } else {
              // console.log(error.response.status);
            }
          });
      } else {
        this.$store.state.prompt_signup = true;
      }
    },
    approveRequest() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "approve_request", {
          session_id: self.$store.state.session_id,
          friend_id: self.user_id
        })
        .then(function(response) {
          if ([200].includes(response.status)) {
            self.remove_friend_banner = false;
            self.user_type = "friend";
            location.reload();
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    },
    clickUser(id, name) {
      this.$router.push(
        "/profile/" + id + "/" + name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()
      );
    },
    resetRatings() {
      var self = this;
      axios
        .post(self.$store.state.api_host + "reset_ratings", {
          session_id: self.$store.state.session_id
        })
        .then(function(response) {
          self.reset_ratings_banner = false;
          if ([200].includes(response.status)) {
            self.contents_rated = [];
            axios
              .post(self.$store.state.api_host + "update_profile", {
                session_id: self.$store.state.session_id,
                suggestions_ready_message_seen: false
              })
              .then(function(response) {
                if ([200].includes(response.status)) {
                  self.renderComponent = true;
                  self.reRender();
                }
              });
          } else {
            // console.log(response.status);
          }
        })
        .catch(function(error) {
          self.reset_ratings_banner = false;
          // console.log(error);
          if ([401, 419].includes(error.response.status)) {
            window.location =
              self.$store.state.login_host +
              "logout?session_id=" +
              self.$store.state.session_id;
            self.$store.state.session_id = null;
            self.$emit("logging-out");
          } else {
            // console.log(error.response.status);
          }
        });
    }
  },
  computed: {
    router_path: function() {
      return this.$route.path;
    },
    rating_tab_string() {
      return JSON.stringify(this.rating_tab);
    },
    country_flag() {
      var country;
      for (country in this.$store.state.countries) {
        if (
          this.$store.state.countries[country].country_name ==
          this.$store.state.user.profile.country
        ) {
          return this.$store.state.countries[country].country_flag;
        }
      }
    },
    more_header_positive() {
      return (
        `
                position: fixed;
                width: 90%;
                height: 50px;
                white-space: nowrap;
                margin-left: 6%;
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 263, 58)
        ) +
        `px;
                background-color: #f1f1f1;
                border-radius: 10px;
                text-align: left;
                padding: 1%;
                `
      );
    },
    close_more_header_positive() {
      return (
        `
                position: fixed;
                width: 20px;
                height: 20px;
                left: calc(50vw + 45% - 25px);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 259, 62)
        ) +
        `px;
                background-image: url('` +
        require(`./../images/close.png`) +
        `');
                background-size: 100%;
                background-repeat: no-repeat;
                background-position: center;
                border: 0;
                padding: 0;
                cursor: pointer;
                -webkit-tap-highlight-color: rgba(0,0,0,0);
	              -webkit-tap-highlight-color: transparent;
                `
      );
    },
    desktop_more_header_positive() {
      return (
        `
                position: fixed;
                width: 750px;
                height: 50px;
                white-space: nowrap;
                left: 50%;
                transform: translateX(-375px);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 273, 58)
        ) +
        `px;
                background-color: #f1f1f1;
                border-radius: 10px;
                text-align: left;
                padding: 10px;
                `
      );
    },
    desktop_close_more_header_positive() {
      return (
        `
                position: fixed;
                width: 25px;
                height: 25px;
                left: calc(50vw + 375px - 35px);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 263, 68)
        ) +
        `px;
                background-image: url('` +
        require(`./../images/close.png`) +
        `');
                background-size: 100%;
                background-repeat: no-repeat;
                background-position: center;
                border: 0;
                padding: 0;
                cursor: pointer;
                -webkit-tap-highlight-color: rgba(0,0,0,0);
	              -webkit-tap-highlight-color: transparent;
                `
      );
    },
    more_header_negative() {
      return (
        `
                position: fixed;
                width: 90%;
                white-space: nowrap;
                margin-left: 6%;
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 70, 59)
        ) +
        `px;
                background-color: #ffffff;
                border-radius: 10px;
                text-align: left;
                padding: 6px;
                `
      );
    },
    close_more_header_negative() {
      return (
        `
                position: fixed;
                width: 30px;
                height: 30px;
                left: calc(50vw + 45% - 27px);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 70, 59)
        ) +
        `px;
                background-image: url('` +
        require(`./../images/close.png`) +
        `');
                background-size: 66%;
                background-repeat: no-repeat;
                background-position: center;
                border: 0;
                padding: 0;
                cursor: pointer;
                background-color: #ffffff;
                border-radius: 50%;
                -webkit-tap-highlight-color: rgba(0,0,0,0);
	              -webkit-tap-highlight-color: transparent;
                `
      );
    },
    desktop_more_header_negative() {
      return (
        `
                position: fixed;
                white-space: nowrap;
                width: 750px;
                left: 50%;
                transform: translateX(-375px);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 70, 59)
        ) +
        `px;
                background-color: #ffffff;
                border-radius: 10px;
                text-align: left;
                padding: 10px;
                `
      );
    },
    desktop_close_more_header_negative() {
      return (
        `
                position: fixed;
                width: 25px;
                height: 25px;
                left: calc(50vw + 375px - 35px);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 63, 66)
        ) +
        `px;
                background-image: url('` +
        require(`./../images/close.png`) +
        `');
                background-size: 100%;
                background-repeat: no-repeat;
                background-position: center;
                border: 0;
                padding: 0;
                cursor: pointer;
                background-color: #ffffff;
                border-radius: 50%;
                -webkit-tap-highlight-color: rgba(0,0,0,0);
	              -webkit-tap-highlight-color: transparent;
                `
      );
    },
    more_contents() {
      return (
        `
                position: fixed;
                display: inline-flex;
                overflow-x: scroll;
                width: 90%;
                white-space: nowrap;
                margin-left: -44%;
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 238, 83)
        ) +
        `px;
                background-color: #f1f1f1;
                border-radius: 20px;
                padding-left: 3%;
                `
      );
    },
    desktop_more_contents() {
      return (
        `
                position: fixed;
                display: inline-flex;
                overflow-x: scroll;
                width: 750px;
                white-space: nowrap;
                left: 50%;
                transform: translateX(-50%);
                top: ` +
        String(
          Math.max(parseInt(this.$store.state.click_coordinate_y) - 238, 93)
        ) +
        `px;
                background-color: #f1f1f1;
                padding-left: 15px;
                padding-bottom: 10px;
                border-radius: 10px;
                `
      );
    },
    profile_status_icon() {
      return (
        `
                display: inline-block;
                width: 35px;
                height: 35px;
                margin-top: 17px;
                position: relative;
                background-image: url('` +
        require(`./../images/` + this.profile_status + `.png`) +
        `');
                background-size: 100% 100%;
                border: none;
                outline: 0;
                `
      );
    },
    profile_more_settings() {
      return (
        `
                position: relative;
                width: 45px;
                height: 45px;
                background-image: url('` +
        this.country_flag +
        `');
                background-repeat: no-repeat;
                background-position: center;
                background-size: contain;
                `
      );
    }
  },
  watch: {
    router_path: {
      handler: function(path) {
        if (
          this.$store.state.current_path.startsWith("/profile/") &&
          path.startsWith("/profile/")
        ) {
          this.renderComponent = false;
          this.$nextTick(() => {
            this.renderComponent = true;
            this.reRender();
          });
        }
      }
    }
  }
};
</script>

<style lang="scss">
.profile-cover {
  position: relative;
  display: inline-grid;
  width: 100%;
  height: 50vw;
  margin-top: calc(50px + 2.5%);
  overflow: hidden;
  background-color: #f5f4f4;
  border-radius: 7px;
}
.desktop-profile-cover {
  position: relative;
  display: inline-grid;
  width: 100%;
  height: 400px;
  margin-top: 70px;
  overflow: hidden;
  background-color: #f5f4f4;
  border-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.poster-1 {
  position: absolute;
  width: 15%;
  margin-left: -2%;
  margin-top: -2%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-2 {
  position: absolute;
  width: 20%;
  margin-left: 13%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-3 {
  position: absolute;
  width: 13%;
  margin-left: 33%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-4 {
  position: absolute;
  width: 18%;
  margin-left: 43%;
  margin-top: -12%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-5 {
  position: absolute;
  width: 20%;
  margin-left: 68%;
  margin-top: 34%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-6 {
  position: absolute;
  width: 12.7%;
  margin-left: 80%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-7 {
  position: absolute;
  width: 20%;
  margin-left: -7%;
  margin-top: 36%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-8 {
  position: absolute;
  width: 23.4%;
  margin-left: 92.7%;
  margin-top: -1%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-9 {
  position: absolute;
  width: 20%;
  margin-left: 13%;
  margin-top: 45%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.poster-10 {
  position: absolute;
  width: 13%;
  margin-left: 87.7%;
  margin-top: 34%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-1 {
  position: absolute;
  width: 30%;
  margin-left: 13%;
  margin-top: -1.8%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-2 {
  position: absolute;
  width: 35%;
  margin-left: 33%;
  margin-top: 34%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-3 {
  position: absolute;
  width: 31.7%;
  margin-left: 61%;
  margin-top: -2.7%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-4 {
  position: absolute;
  width: 30%;
  margin-left: -17%;
  margin-top: 20%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.cover-5 {
  position: absolute;
  width: 34%;
  margin-left: 46%;
  margin-top: 15%;
  /* padding-right: 2px; */
  /* padding-bottom: 2px; */
}
.profile-pp-cropper {
  width: 20vw;
  height: 20vw;
  margin-top: -13vw;
  margin-left: 37.5vw;
  position: absolute;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid #ffffff;
  z-index: 2;
  background-color: #ffffff;
}
.desktop-profile-pp-cropper {
  width: 175px;
  height: 175px;
  margin-top: -100px;
  margin-left: 387.5px;
  position: absolute;
  overflow: hidden;
  border-radius: 50%;
  border: 2px solid #ffffff;
  z-index: 2;
  background-color: #ffffff;
}
.profile-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.user-name {
  padding-bottom: 5px;
  margin-top: 9vw;
}
.desktop-user-name {
  padding-bottom: 5px;
  margin-top: 90px;
}
h4 {
  font-size: 23px;
  color: #333333;
}
.update-profile-status {
  position: fixed;
  width: 72%;
  left: 14%;
  top: 40vh;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 1%;
  z-index: 100000;
}
.desktop-update-profile-status {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 40vh;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 20px;
  z-index: 100000;
}
.profile-status-checkbox {
  display: block;
  position: relative;
  width: 50%;
  margin-left: 10%;
  margin-bottom: 0%;
  font-size: 4vw;
  text-align: left;
  padding: 2%;
  border-bottom: 1px solid #dad8d8;
}
.desktop-profile-status-checkbox {
  display: block;
  position: relative;
  font-size: 17px;
  text-align: left;
  padding: 10px;
  border-bottom: 1px solid #dad8d8;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-status-checkmark-abled {
  position: absolute;
  top: 25%;
  left: 5.5%;
  height: 4.5vw;
  width: 4.5vw;
  background-color: #f1f1f1;
}
.desktop-profile-status-checkmark-abled {
  position: absolute;
  left: 10px;
  height: 35px;
  width: 35px;
  background-color: #f1f1f1;
}
.profile-status-checkbox input:checked ~ .profile-status-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.desktop-profile-status-checkbox
  input:checked
  ~ .desktop-profile-status-checkmark-abled {
  background-color: #ffffff;
  background-image: url("./../images/checked.svg");
}
.checkbox-input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-status-checkmark-text {
  position: absolute;
  margin-left: 5%;
  margin-top: 4%;
}
.profile-status-public-option-icon {
  position: relative;
  display: inline-block;
  margin-left: 24%;
  margin-top: 3%;
  height: 4.7vw;
  width: 4.7vw;
  background-image: url("./../images/public.png");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.profile-status-friends-option-icon {
  position: relative;
  display: inline-block;
  margin-left: 24%;
  margin-top: 3%;
  height: 4.7vw;
  width: 4.7vw;
  background-image: url("./../images/friends.png");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.profile-status-private-option-icon {
  position: relative;
  display: inline-block;
  margin-left: 24%;
  margin-top: 3%;
  height: 4.7vw;
  width: 4.7vw;
  background-image: url("./../images/private.png");
  background-size: 100% 100%;
  border: none;
  outline: 0px;
}
.content-type-tabs {
  right: 15px;
  margin-top: 10px;
  background-color: #ffffff;
  position: fixed;
  overflow: hidden;
  padding: 0px 10px;
  z-index: 10001;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
}
.content-type-tabs a {
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
  border-radius: 5px 3px 0 0;
  padding: 6px 0px;
  font-size: 15px;
  text-transform: uppercase;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 3;
  font-weight: bold;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.content-type-tabs a.is-active {
  font-weight: bold;
}
.content-type-tabs a.is-active:after {
  content: "";
  position: absolute;
  left: calc(50% - 7.5px);
  bottom: 0px;
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
}
.watching-these-days {
  display: inline-flex;
  margin-top: 5%;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  background-color: #f9f9f9;
  border-radius: 7px;
  padding: 7px;
}
.watching-these-days-card-container {
  position: relative;
  margin-top: 7%;
  margin-right: 3%;
}
.watching-these-days-card {
  width: 21vw;
  height: 31.5vw;
  border-radius: 7px;
}
.watching-these-days-no-card {
  width: 21vw;
  height: 31.5vw;
  background-image: url("./../images/plus.svg");
  background-size: 35% 35%;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #f5f4f4;
  border-radius: 7px;
}
.remove-card {
  position: absolute;
  right: -5px;
  top: -5px;
  height: 4vw;
  width: 4vw;
  background-image: url("./../images/close.png");
  background-color: #706f6fb2;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  border-radius: 10px;
}
.fadeIn {
  animation: fadeIn 0.3s;
}
.fadeOut {
  animation: fadeOut 0.6s;
}
.add-content-search .search-box {
  position: fixed;
  width: 65%;
  left: 18%;
  margin-top: 49%;
  z-index: 100001;
}
.add-content-search .search-btn-clear-text {
  position: fixed;
  display: block;
  right: 19%;
  margin-top: 49%;
  height: 18px;
  width: 18px;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  background-image: url("./../images/close.png");
  background-size: 100% 100%;
  animation: 0.3s fadeIn;
  z-index: 100001;
}
.add-content-search .filter-contents {
  overflow-y: scroll;
  width: 60%;
  white-space: nowrap;
  left: 20.5%;
  margin-top: 50%;
  background-color: white;
  z-index: 100000;
  position: fixed;
  height: 35%;
}
.add-content-search .filter-contents .content-items {
  overflow-y: scroll;
  height: 100%;
  margin-top: 0%;
}
.add-content-search .no-content-box {
  margin-top: 0%;
  height: 100%;
  overflow-y: scroll;
  background: #fdfdfd;
}
.add-content-search .no-content-found {
  position: relative;
  top: 50%;
  font-size: 15px;
  text-align: center;
  transform: translateY(-50%);
}
.add-content-search .searching-content-box {
  margin-top: 0%;
  height: 100%;
  overflow-y: scroll;
  background: #fdfdfd;
}
.add-content-search .searching-content {
  position: relative;
  top: 50%;
  font-size: 15px;
  text-align: center;
  transform: translateY(-50%);
}
.black-background {
  position: fixed;
  width: 100%;
  height: 150%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  top: 0%;
  left: 0%;
  z-index: 100000;
}
.total-watched-container {
  position: relative;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.total-watched {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  font-size: calc(14px + 0.7vw);
}
.desktop-total-watched {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  font-size: 23px;
}
.total-watched-time {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  font-size: calc(14px + 0.7vw);
}
.desktop-total-watched-time {
  color: #333333;
  text-align: left;
  font-size: 23px;
}
.fav-artists-container {
  position: relative;
  margin-left: 2.5%;
  margin-top: 15px;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.desktop-fav-artists-container {
  position: relative;
  margin-top: 15px;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 14px;
}
.fav-artist-category {
  position: absolute;
  float: left;
  transform: rotate(270deg);
  transform-origin: left center 0;
  border-radius: 5px 3px;
  text-align: center;
  font-weight: normal;
  font-size: 3.5vw;
  margin-left: 1%;
  margin-top: calc(21% + 10px);
  width: 20%;
  color: #0e0d0d;
  text-transform: uppercase;
  letter-spacing: 0px;
}
.desktop-fav-artist-category {
  position: absolute;
  float: left;
  transform: rotate(270deg);
  transform-origin: left center 0;
  border-radius: 5px 3px;
  text-align: center;
  font-weight: normal;
  font-size: 15px;
  margin-left: 1%;
  margin-top: 151px;
  width: 20%;
  color: #0e0d0d;
  text-transform: uppercase;
  letter-spacing: 0px;
}
.fav-artists {
  display: inline-flex;
  overflow-x: scroll;
  width: 94%;
  white-space: nowrap;
  padding: 10px;
  margin-left: 4%;
  margin-bottom: 5px;
  margin-top: 5px;
}
.fav-artists::-webkit-scrollbar {
  display: none;
}
::-webkit-scrollbar {
  display: none;
}
.fav-artist-cropper {
  display: inline-block;
  width: 55px;
  height: 70px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.desktop-fav-artist-cropper {
  display: inline-block;
  width: 75px;
  height: 95px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.fav-artist-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.fav-artist-name {
  margin-top: 7px;
  position: relative;
  font-size: 10px;
  width: 55px;
  white-space: normal;
  font-weight: 700;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333;
}
.desktop-fav-artist-name {
  margin-top: 7px;
  position: relative;
  font-size: 12px;
  width: 75px;
  white-space: normal;
  font-weight: 700;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333;
}
.fav-catg-artists-container {
  display: inline-block;
  margin-right: 20px;
  vertical-align: top;
  text-align: center;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.fav-artists-more-contents-container {
  position: fixed;
  z-index: 100000;
  top: 0;
  left: 0;
  width: 100%;
  height: 120%;
  background-color: rgba(0, 0, 0, 0.75);
  display: table;
  transition: opacity 0.3s ease;
}
.fav-artists-content-container {
  display: inline-block;
  padding-right: 4%;
  margin-top: 2%;
  vertical-align: top;
  text-align: center;
}
.desktop-fav-artists-content-container {
  display: inline-block;
  padding-right: 15px;
  margin-top: 15px;
  vertical-align: top;
  text-align: center;
}
.fav-artists-content-poster {
  display: inline;
  margin: 0 auto;
  width: 100px;
  height: 150px;
  border-radius: 7px;
}
.desktop-fav-artists-content-poster {
  display: inline;
  margin: 0 auto;
  width: 125px;
  height: 187.5px;
  border-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.fav-artists-content-name {
  margin-top: 0%;
  position: relative;
  font-size: 12px;
  width: 100px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-tabs {
  margin-bottom: -2px;
  margin-top: 5%;
  padding-bottom: 0.5%;
  width: 100%;
  background-color: #f8f8f8;
  overflow: hidden;
  text-align: center;
  display: grid;
  grid-column-gap: 10px;
}
.profile-tabs a {
  position: relative;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  padding: 6px 0px;
  transition: background-color 0.2s;
  border-radius: 5px 3px 0 0;
  font-weight: normal;
  font-size: calc(11px + 1vw);
  text-transform: uppercase;
  display: inline-grid;
  grid-row-start: 1;
  grid-row-end: 3;
}
.profile-tabs a.is-active {
  font-weight: bold;
}
.profile-tabs a.is-active:after {
  content: "";
  position: absolute;
  bottom: -2px;
  left: calc(50% - 7.5px);
  width: 15px;
  height: 3px;
  background-color: #333333;
  border-radius: 3px;
}
.ratings-container {
  overflow-x: scroll;
  width: calc(100% - 35px);
  display: flex;
  margin-bottom: 2%;
  margin-top: 2%;
  margin-left: 10px;
}
.desktop-ratings-container {
  overflow-x: scroll;
  width: calc(100% - 35px);
  display: flex;
  margin-top: 5px;
  margin-left: 10px;
}
.desktop-ratings-container::-webkit-scrollbar {
  display: none;
}
.ratings-item-container {
  position: relative;
  margin-top: 1.5%;
  margin-right: 2%;
  margin-bottom: 2%;
  margin-left: 2%;
  display: inline-block;
  border-radius: 7px;
}
.ratings-item-poster {
  display: inline;
  width: 106px;
  height: 159px;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
}
.desktop-ratings-item-poster {
  display: inline;
  width: 150px;
  height: 225px;
  border-top-left-radius: 7px;
  border-top-right-radius: 7px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-user-rating-container {
  position: relative;
  margin-top: -4%;
  text-align: left;
}
.desktop-profile-user-rating-container {
  position: relative;
  text-align: left;
}
.profile-thumbs-up-true {
  position: relative;
  height: 28px;
  width: 28px;
  left: 0%;
  margin-top: 3px;
  background-image: url("./../images/thumbs_up_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-thumbs-up-false {
  position: relative;
  height: 28px;
  width: 28px;
  left: 0%;
  margin-top: 3px;
  background-image: url("./../images/thumbs_up_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-thumbs-down-true {
  position: absolute;
  height: 28px;
  width: 28px;
  margin-left: 10px;
  margin-top: 4px;
  background-image: url("./../images/thumbs_down_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-thumbs-down-false {
  position: absolute;
  height: 28px;
  width: 28px;
  margin-left: 10px;
  margin-top: 4px;
  background-image: url("./../images/thumbs_down_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-love-true {
  position: absolute;
  height: 28px;
  width: 28px;
  right: 0%;
  margin-top: 3px;
  background-image: url("./../images/love_true.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-love-false {
  position: absolute;
  height: 28px;
  width: 28px;
  right: 0%;
  margin-top: 3px;
  background-image: url("./../images/love_false.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.rating-tabs {
  overflow: hidden;
  margin-left: 25%;
  margin-bottom: 2%;
  margin-top: 2%;
  width: 50%;
}
.rating-tabs a.all-ratings {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  background-color: #ffffff;
  height: 7.5vw;
  width: 7.5vw;
  margin-left: 5%;
  margin-top: 1.5%;
  border: none;
  outline: 0;
  padding: 5%;
  font-weight: bold;
  font-size: 4vw;
}
.rating-tabs a.all-ratings-are-active {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  height: 9vw;
  width: 9vw;
  margin-left: 5%;
  margin-top: 1.5%;
  background-color: #c4bdbdc0;
  border: none;
  outline: 0;
  border-radius: 5px;
  padding: 4%;
  font-weight: bold;
  font-size: 4vw;
}
.rating-tabs a.like {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  background-color: #ffffff;
  height: 7.5vw;
  width: 7.5vw;
  margin-left: 6%;
  margin-top: 1.5%;
  background-image: url("./../images/thumbs_up_true.svg");
  background-size: 85% 85%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
}
.rating-tabs a.like-is-active {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  height: 9vw;
  width: 9vw;
  margin-left: 6%;
  margin-top: 1%;
  background-image: url("./../images/thumbs_up_true.svg");
  background-color: #c4bdbdc0;
  background-size: 85% 85%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
  border-radius: 5px;
}
.rating-tabs a.dislike {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  background-color: #ffffff;
  height: 7.5vw;
  width: 7.5vw;
  margin-left: 6%;
  margin-top: 3.5%;
  background-image: url("./../images/thumbs_down_true.svg");
  background-size: 85% 85%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
}
.rating-tabs a.dislike-is-active {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  height: 9vw;
  width: 9vw;
  margin-left: 6%;
  margin-top: 1.5%;
  background-image: url("./../images/thumbs_down_true.svg");
  background-color: #c4bdbdc0;
  background-size: 85% 85%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
  border-radius: 5px;
}
.rating-tabs a.love {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  background-color: #ffffff;
  height: 7.5vw;
  width: 7.5vw;
  margin-left: 6%;
  margin-top: 2%;
  background-image: url("./../images/love_true.svg");
  background-size: 85% 85%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
}
.rating-tabs a.love-is-active {
  float: left;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.2s;
  height: 9vw;
  width: 9vw;
  margin-left: 6%;
  margin-top: 1%;
  background-image: url("./../images/love_true.svg");
  background-color: #c4bdbdc0;
  background-size: 85% 85%;
  background-repeat: no-repeat;
  background-position: center;
  padding: 0;
  border: none;
  outline: 0;
  border-radius: 5px;
}
.genres-container {
  margin-top: 15px;
  color: #333333;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
  font-weight: bold;
  font-size: 15px;
}
.genres-pie {
  display: inline-flex;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.desktop-genres-pie {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 50%;
  border-radius: 7px;
  padding: 7px;
}
.watched-timeline-container {
  margin-top: 15px;
  color: #333333;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
  padding-bottom: 45px;
  font-weight: bold;
  font-size: 15px;
}
.watched-timeline {
  display: inline-flex;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.desktop-watched-timeline {
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 50%;
  border-radius: 7px;
  padding: 7px;
}
.stats-fun-container {
  height: 78vh;
  overflow: scroll;
  margin-bottom: 2%;
}
.banner {
  position: absolute;
  margin-left: 2%;
  margin-top: 1%;
  font-size: 10px;
  background-color: #fdb5b5;
  padding: 1%;
  border-radius: 5px;
}
.friendship-status {
  position: absolute;
  margin-left: 3%;
  text-align: center;
  font-size: 14px;
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
}
.share-icon {
  position: absolute;
  margin-left: 3%;
  width: 28px;
  height: 28px;
  background-image: url("./../images/share-icon.svg");
  background-color: #ffffff;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.approve-request {
  position: absolute;
  margin-left: 5%;
  text-align: center;
  font-size: calc(10px + 10%);
  color: #ffffff;
  border-radius: 5px;
  background-color: #3366bb;
  padding: 5px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.reject-request {
  position: absolute;
  margin-left: calc(18% + 15px);
  text-align: center;
  font-size: calc(10px + 10%);
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-friend-container {
  vertical-align: top;
  text-align: center;
  border-radius: 7px;
  margin-right: 15px;
  position: relative;
  display: inline-block;
}
.profile-friend-pp-cropper {
  width: 65px;
  height: 65px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 2;
  background-color: #ffffff;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-friend-pp {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
}
.profile-friend-name {
  margin: 0 auto;
  position: relative;
  font-size: 13px;
  width: 65px;
  margin-top: 3px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  overflow: hidden;
  text-transform: capitalize;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-friends-box {
  width: 100%;
  margin-bottom: 2%;
  margin-top: 1%;
  margin-left: 7px;
  padding: 7px;
  text-align: left;
  overflow-x: scroll;
  display: flex;
}
.no-ratings-container {
  height: 32vh;
  overflow: scroll;
  margin-bottom: 2%;
}
.reset-ratings {
  position: absolute;
  width: 100px;
  right: 7px;
  margin-top: -5px;
  text-align: center;
  font-size: 14px;
  color: #333333;
  border-radius: 5px;
  background-color: #ffffff;
  border: solid 1px #777777;
  padding: 4px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.reset-ratings-banner {
  position: absolute;
  margin-left: 28%;
  margin-top: -9%;
  font-size: 2.7vw;
  background-color: #fdb5b5;
  padding: 1%;
  border-radius: 5px;
}
.prompted-box {
  position: fixed;
  background-color: #ffffff;
  top: 35vh;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 7px;
  padding: 10px;
  z-index: 100001;
}
.prompted-user-cropper {
  display: inline-block;
  width: 80px;
  height: 80px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
  z-index: 100001;
}
.prompted-user-pic {
  display: inline;
  margin: 0 auto;
  top: 100%;
  width: 100%;
  z-index: 100001;
}
.prompted-user-name {
  margin-top: 3px;
  max-height: 34px;
  position: relative;
  white-space: normal;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.25;
  letter-spacing: normal;
  color: #333333;
  text-transform: capitalize;
  overflow: hidden;
  z-index: 100001;
}
.prompted-box p {
  position: relative;
  margin-top: 20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  white-space: normal;
}
.prompted-box span {
  position: relative;
  margin-top: 20px;
  font-size: 14px;
  font-weight: normal;
  font-style: normal;
  font-stretch: normal;
  line-height: 1.31;
  letter-spacing: normal;
  text-align: center;
  color: #333333;
  white-space: normal;
}
.profile-prompted-buttons {
  // min-width: 45vw;
  margin-top: 20px;
}
.prompted-cancel-button {
  float: left;
  width: 50%;
  padding: 3px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.prompted-confirm-button {
  float: right;
  width: 50%;
  border-left: solid 1px #919090;
  padding: 3px;
  cursor: pointer;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.prompted-android-share-button {
  float: right;
  width: 50%;
  cursor: pointer;
  border: 0;
  border-left: solid 1px #919090;
  padding: 3px;
  background: transparent;
  -webkit-user-select: none; /* Chrome/Safari */
  -moz-user-select: none; /* Firefox */
  -ms-user-select: none; /* IE10+ */
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
  font-size: 16px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
  font-family: "Roboto", sans-serif;
}
.profile-show-switch {
  position: absolute;
  right: 0px;
  margin-top: 0px;
  height: 7px;
  width: 7px;
  background-image: url("./../images/red_dot.png");
  background-color: #e9f3f8;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 10000;
}
.profile-details {
  position: relative;
  display: -webkit-inline-box;
  white-space: nowrap;
  text-align: left;
  width: 100%;
  overflow: hidden;
}
.desktop-profile-details {
  position: relative;
  display: -webkit-inline-box;
  white-space: nowrap;
  text-align: left;
  width: 60%;
  overflow: hidden;
  margin-top: 15px;
}
.profile-status {
  text-align: center;
  margin-left: 20px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-status-title {
  margin: 0 auto;
  position: relative;
  font-size: 12px;
  white-space: normal;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.profile-connections {
  text-align: center;
  margin-left: calc(33.33% - 70.5px);
  font-size: 15px;
  margin-top: 15px;
  width: 85px;
  white-space: initial;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #333333;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-more {
  position: relative;
  width: 85px;
  height: 85px;
  margin-top: 1px;
  margin-left: calc(33.33% - 70.5px - 32.5px);
  background-image: url("./../images/three_dots.png");
  background-color: #ffffff;
  background-repeat: no-repeat;
  background-position: center;
  background-size: 40%;
  padding: 0;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-more-options {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  top: 40vh;
  max-height: 50vh;
  background-color: #ffffff;
  border-radius: 7px;
  padding: 10px 10px 10px 5px;
  z-index: 100001;
  white-space: nowrap;
}
.profile-more-option {
  position: relative;
  display: flex;
  text-align: left;
  margin-left: 10px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-more-about-us {
  position: relative;
  width: 50px;
  height: 50px;
  background-image: url("./../images/flibo-logo-dark.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
.profile-more-logout {
  position: relative;
  width: 50px;
  height: 50px;
  background-image: url("./../images/logout.svg");
  background-repeat: no-repeat;
  background-size: 81%;
  background-position: center;
}
.profile-more-option-text {
  position: relative;
  margin-left: 15px;
  margin-top: 15px;
  font-size: 17px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.17;
  letter-spacing: normal;
  color: #333333;
}
.profile-connections-notification {
  position: absolute;
  margin-left: 35px;
  margin-top: -25px;
  height: 7px;
  width: 7px;
  background-image: url("./../images/red_dot.png");
  background-color: #e9f3f8;
  background-size: 100% 100%;
  border: none;
  outline: 0;
  z-index: 9999;
}
.profile-ratings {
  position: relative;
  margin-top: 15px;
  color: #333333;
  font-size: 12.5px;
  text-align: left;
  width: 100%;
  border-radius: 7px;
  padding: 7px;
}
.fetching-profile-message {
  position: fixed;
  top: calc(50% - 36px);
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  width: 95%;
}
.profile-views {
  position: relative;
  text-align: center;
  margin-left: calc(33.33% - 70.5px);
  z-index: 1;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-views-icon {
  display: inline-block;
  width: 35px;
  height: 35px;
  margin-top: 9px;
  position: relative;
  background-image: url("./../images/eye.svg");
  background-size: 100% 100%;
  border: none;
  outline: 0;
}
.profile-views-count {
  position: relative;
  margin-top: -9px;
  font-size: 22px;
  white-space: initial;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.6;
  letter-spacing: normal;
  color: #333333;
}
.sk-folding-cube {
  margin: 20px auto;
  width: 40px;
  height: 40px;
  position: relative;
  -webkit-transform: rotateZ(45deg);
  transform: rotateZ(45deg);
}

.sk-folding-cube .sk-cube {
  float: left;
  width: 50%;
  height: 50%;
  position: relative;
  -webkit-transform: scale(1.1);
  -ms-transform: scale(1.1);
  transform: scale(1.1);
}
.sk-folding-cube .sk-cube:before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(235, 225, 225, 0.75);
  -webkit-animation: sk-foldCubeAngle 2.4s infinite linear both;
  animation: sk-foldCubeAngle 2.4s infinite linear both;
  -webkit-transform-origin: 100% 100%;
  -ms-transform-origin: 100% 100%;
  transform-origin: 100% 100%;
}
.sk-folding-cube .sk-cube2 {
  -webkit-transform: scale(1.1) rotateZ(90deg);
  transform: scale(1.1) rotateZ(90deg);
}
.sk-folding-cube .sk-cube3 {
  -webkit-transform: scale(1.1) rotateZ(180deg);
  transform: scale(1.1) rotateZ(180deg);
}
.sk-folding-cube .sk-cube4 {
  -webkit-transform: scale(1.1) rotateZ(270deg);
  transform: scale(1.1) rotateZ(270deg);
}
.sk-folding-cube .sk-cube2:before {
  -webkit-animation-delay: 0.3s;
  animation-delay: 0.3s;
}
.sk-folding-cube .sk-cube3:before {
  -webkit-animation-delay: 0.6s;
  animation-delay: 0.6s;
}
.sk-folding-cube .sk-cube4:before {
  -webkit-animation-delay: 0.9s;
  animation-delay: 0.9s;
}
@-webkit-keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

@keyframes sk-foldCubeAngle {
  0%,
  10% {
    -webkit-transform: perspective(140px) rotateX(-180deg);
    transform: perspective(140px) rotateX(-180deg);
    opacity: 0;
  }
  25%,
  75% {
    -webkit-transform: perspective(140px) rotateX(0deg);
    transform: perspective(140px) rotateX(0deg);
    opacity: 1;
  }
  90%,
  100% {
    -webkit-transform: perspective(140px) rotateY(180deg);
    transform: perspective(140px) rotateY(180deg);
    opacity: 0;
  }
}

.quote-font {
  font-size: 23px;
  font-weight: bold;
  line-height: 1.5;
  font-stretch: normal;
  font-style: normal;
  letter-spacing: normal;
  color: #adaaaa;
  font-family: "Poiret One", cursive;
}
.profile-platforms {
  text-align: center;
  position: absolute;
  overflow-x: scroll;
  white-space: nowrap;
  margin-top: -33px;
  margin-left: 0px;
  width: 106px;
  padding: 5px 0px;
  border-radius: 0 0 7px 7px;
  background-color: rgba(0, 0, 0, 0.5);
}
.profile-platform-cropper {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.profile-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.profile-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 8px;
  margin-right: 8px;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.profile-by-artist-platforms {
  text-align: center;
  position: absolute;
  overflow-x: scroll;
  white-space: nowrap;
  margin-top: -34px;
  margin-left: 0px;
  width: 100px;
  padding: 5px;
  border-radius: 0 0 7px 7px;
  background-color: rgba(0, 0, 0, 0.5);
}
.profile-by-artist-platform-cropper {
  width: 20px;
  height: 20px;
  position: relative;
  overflow: hidden;
  border-radius: 50%;
}
.profile-by-artist-platform-icon {
  display: inline-block;
  position: absolute;
  width: 100%;
  margin-left: -50%;
}
.profile-by-artist-platforms-container {
  display: inline-block;
  vertical-align: top;
  text-align: center;
  margin-left: 8px;
  margin-right: 8px;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -o-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
.collage-download-button {
  position: absolute;
  width: 25px;
  height: 25px;
  right: 30px;
  transform: translateX(10px);
  background-image: url("./../images/download.svg");
  background-size: 100% 100%;
  border: none;
  outline: 0;
  cursor: pointer;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  -webkit-tap-highlight-color: transparent;
}
</style>
