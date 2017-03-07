var Contact;
var Tag;
var contacts;
var tags;
var manager;

$(function() {
  var $main = $('main');
  // var $search = $contacts.find('#search');
  // var $newTag = $tags.find('#new-tag');
  var templates = {};

  Contact = {
    update: function($form) {
      $form.serializeArray().forEach(function(input) {
        this[input.name] = input.value;
      });
    },
    init: function(id, $form) {
      this.id = id;
      this.update($form);
    }
  },

  contacts = {
    $page: $main.find('#contacts'),
    $el: $main.find('#contact-list'),
    $new: $main.find('#new-contact'),
    $edit: $main.find('#edit-contact'),
    collection: [],
    lastId: 0,
    template: templates.contacts,
    new: function(e) {
      e.preventDefault();

      this.$page.fadeOut();
      $newContact.html(templates.new({ tags: tags.collection }));
      $newContact.fadeIn();
    },
    add: function(contact) {
      if (this.$el.find('li').length) {
        this.$el.append(templates.contact(contact));
      } else {
        this.$el.html(templates.contactList({ contacts: this.contacts }));
      }
    },
    create: function(e) {
      e.preventDefault();
      var $form = $(e.target);

      this.lastId++;
      contact = Object.create(Contact).init(this.lastId, $form)
      this.collection.push(contact);
      this.add(contact);
      this.show();
    },
    edit: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var id = $el.closest('li').data('id');
      var contact = this.find(id);
      var otherTags = tags.collection.filter(function(tag) {
        return tag !== contact.tag;
      });

      this.$edit.html(templates.edit({ contact: contact, tags: otherTags }));
      this.$edit.fadeIn();
      this.$page.fadeOut();
    },
    modify: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var id = $form.data('id');
      var contact = this.find(id);
      
      contact.update($form);
      this.render();
      this.show();
    },
    filter: function() {

    },
    find: function(idx) {
      return this.collection.find(function(contact) {
        return contact.id === idx;
      });
    },
    destroy: function(idx) {
      this.collection = this.collection.filter(function(contact) {
        return contact.id !== idx;
      });
    },
    emptyMessage: function() {
      this.$el.append(templates.emptyMessage());
    },
    render: function() {
      this.$el.html(this.template({ contacts: this.collection }));
    },
    show: function() {
      $('.container:visible').fadeOut();
      this.$page.fadeIn();
    },
    load: function() {
      this.collection = JSON.parse(localStorage.getItem('contacts')) || [];
      this.lastId = parseInt(localStorage.getItem('lastId'), 10);
    },
    save: function() {
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
      localStorage.setItem('lastId', this.lastId);
    },
    bindEvents: function() {
      $contacts.on('click', 'a.add-contact', this.new.bind(this));
      $newContact.on('submit', this.create.bind(this));

    },
    init: function() {

    }
  },

  tags = {
    $el: contacts.$page.find('#tag-list'),
    collection: [],
    template: templates.tags,
    find: function(tagName) {
      return this.collection.find(function(tag) {
        return tag === tagName;
      });
    },
    delete: function(tagName) {
      this.collection = this.collection.filter(function(tag) {
        return tag !== tagName;
      });
    },
    render: function() {
      this.$el.html(this.template({ tags: this.collection }));
    },
    load: function() {
      this.collection = JSON.parse(localStorage.getItem('tags')) || [];
    },
    save: function() {
      localStorage.setItem('tags', JSON.stringify(this.collection));
    },
    bindEvents: function() {

    },
    init: function() {
      this.load();
    }
  },

  search = {
    name: '',
    tag: '',
  },

  manager = {
    cacheTemplates: function() {
      $("script[type='text/x-handlebars']").each(function() {
        var $template = $(this);
        templates[$template.attr('id')] = Handlebars.compile($template.html());
      });

      $('[data-type=partial]').each(function() {
        var $partial = $(this);
        Handlebars.registerPartial($partial.attr('id'), $partial.html());
      });
    },
    save: function() {
      contacts.save();
      tags.save();
    },
    bindEvents: function() {
      $(window).on('unload', this.save.bind(this));
    },
    init: function() {
      this.cacheTemplates();
      contacts.init();
      tags.init();
      this.bindEvents();
    }
  },

  contactManager = {







    cancel: function(e) {
      e.preventDefault();
      var $el = $(e.target);

      $el.closest('.container').fadeOut();
      $contacts.fadeIn();
    },

    deleteContact: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var $li = $el.closest('li');
      var id = $li.data('id');
      
      if (confirm('Are you sure?')) {
        $li.remove();
        this.destroyContact(id);        
      }
      if (!this.contacts.length) { this.emptyMessage(); }
    },

    

    createTag: function(e) {
      e.preventDefault();
      var tag = $newTag.val();

      if (!tag.length || this.findTag(tag)) { return; }
      this.tags.push(tag);
      $tagList.append(templates.tag(tag));
      $newTag.val('');
    },

    removeTag: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var tag = $el.prev().text();

      if (this.isTagUsedByContacts(tag)) {
        alert("You cannot delete a tag that is used by a contact");
      } else {
        $el.closest('li').remove();
        this.deleteTag(tag);
      }
    },

    

    isTagUsedByContacts: function(tag) {
      return this.contacts.some(function(contact) {
        return contact.tag === tag;
      });
    },

    setTagFilter: function(e) {
      e.preventDefault();
      var $link = $(e.target);

      if ($link.hasClass('active')) {
        $link.removeClass('active');
        this.tagFilter = '';
      } else {
        $tagList.find('a.active').removeClass('active');
        $link.addClass('active');
        this.tagFilter = $link.text();
      }
      this.filterContacts();
    },

    setSearchTerm: function() {
      this.searchTerm = $search.val();
      this.filterContacts();
    },

    filterBySearch: function($li) {
      var search = this.searchTerm;

      return $li.filter(function() {
        var contactName = $(this).find('h3').text();

        return contactName.indexOf(search) !== -1;
      });
    },

    filterByTag: function($li) {
      var tag = this.tagFilter;

      return $li.filter(function() {
        var contactTag = $(this).find('.tag-name').text();

        return contactTag === tag;
      });
    },

    filterContacts: function() {
      var $li = $contactList.find('li');
      var $emptySearch = $contactList.find('#empty-search');

      $li.hide();
      if (this.searchTerm) { $li = this.filterBySearch($li); }
      if (this.tagFilter) { $li = this.filterByTag($li); }
      $li.show();
      if ($li.length) {
        $emptySearch.remove();
      } else {
        if (!$emptySearch.length) {
          $contactList.append(templates.emptySearch());
        }
      }
    },

    bindEvents: function() {
      $editContact.on('submit', this.modifyContact.bind(this));
      $main.on('click', '.cancel', this.cancel.bind(this));
      $contacts.on('click', 'a.edit', this.editContact.bind(this));
      $contacts.on('click', 'a.delete', this.deleteContact.bind(this));
      $search.on('keyup', this.setSearchTerm.bind(this));
      $tags.on('submit', this.createTag.bind(this));
      $tagList.on('click', 'a.tag-name', this.setTagFilter.bind(this));
      $tagList.on('click', 'a.remove-tag', this.removeTag.bind(this));
    },

  };

  manager.init();
});