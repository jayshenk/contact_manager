var contactManager;

$(function() {
  var $main = $('main');
  var $contacts = $main.find('#contacts');
  var $contactList = $contacts.find('section');
  var $newContact = $main.find('#new-contact');
  var $editContact = $main.find('#edit-contact');
  var $search = $contacts.find('#search');
  var $tags = $contacts.find('aside');
  var $tagList = $tags.find('ul');
  var $newTag = $tags.find('#new-tag');
  var templates = [];

  contactManager = {
    contacts: [],

    lastId: 0,

    tags: [],

    searchTerm: '',

    tagFilter: '',

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

    newContact: function(e) {
      e.preventDefault();

      $contacts.fadeOut();
      $newContact.html(templates.new({ tags: this.tags }));
      $newContact.fadeIn();
    },

    addContact: function(contact) {
      if ($contactList.find('li').length) {
        $contactList.find('ul').append(templates.contact(contact));
      } else {
        $contactList.html(templates.contactList({ contacts: this.contacts }));
      }
    },

    createContact: function(e) {
      e.preventDefault();
      this.lastId++;
      var contact = { id: this.lastId };
      var $form = $(e.target);

      contact = this.updateContact(contact, $form);
      this.contacts.push(contact);
      this.addContact(contact);
      this.showContacts();
    },

    findContact: function(idx) {
      return this.contacts.find(function(contact) {
        return contact.id === idx;
      });
    },

    edit: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var id = $el.closest('li').data('id');
      var contact = this.findContact(id);
      var otherTags = this.tags.filter(function(tag) {
        return tag !== contact.tag;
      });

      $editContact.html(templates.edit({ contact: contact, tags: otherTags }));
      $editContact.fadeIn();
      $contacts.fadeOut();
    },

    modify: function(e) {
      e.preventDefault();
      var $form = $(e.target);
      var id = $form.data('id');
      var contact = this.findContact(id);
      
      this.updateContact(contact, $form);
      this.renderContacts();
      this.showContacts();
    },

    updateContact: function(contact, $form) {
      $form.serializeArray().forEach(function(input) {
        contact[input.name] = input.value;
      });
      return contact;
    },

    loadStorage: function() {
      this.contacts = JSON.parse(localStorage.getItem('contacts')) || [];
      this.lastId = parseInt(localStorage.getItem('lastId'), 10);
      this.tags = JSON.parse(localStorage.getItem('tags')) || [];
      $contactList.html(templates.contactList({ contacts: this.contacts }));
      $tagList.html(templates.tags({ tags: this.tags }));
      $contacts.slideDown();
    },

    renderContacts: function() {
      $contactList.html(templates.contactList({ contacts: this.contacts }));
      this.filterContacts();
    },

    showContacts: function() {
      $('.container:visible').fadeOut();
      $contacts.fadeIn();
    },

    emptyContacts: function() {
      $contactList.append(templates.emptyContacts());
    },

    cancel: function(e) {
      e.preventDefault();
      var $el = $(e.target);

      $el.closest('form').get(0).reset();
      $el.closest('.container').fadeOut();
      $contacts.fadeIn();
    },

    delete: function(e) {
      e.preventDefault();
      var $el = $(e.target);
      var $li = $el.closest('li');
      var id = $li.data('id');
      
      if (confirm('Are you sure?')) {
        $li.remove();
        this.destroy(id);        
      }
      if (!this.contacts.length) { this.emptyContacts(); }
    },

    destroy: function(idx) {
      this.contacts = this.contacts.filter(function(contact) {
        return contact.id !== idx;
      });
    },

    findTag: function(tagName) {
      return this.tags.find(function(tag) {
        return tag === tagName;
      });
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

    deleteTag: function(tagName) {
      this.tags = this.tags.filter(function(tag) {
        return tag !== tagName;
      });
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

    save: function() {
      localStorage.setItem('contacts', JSON.stringify(this.contacts));
      localStorage.setItem('lastId', this.lastId);
      localStorage.setItem('tags', JSON.stringify(this.tags));
    },

    bindEvents: function() {
      $contacts.on('click', 'a.add-contact', this.newContact.bind(this));
      $newContact.on('submit', this.createContact.bind(this));
      $editContact.on('submit', this.modify.bind(this));
      $main.on('click', '.cancel', this.cancel.bind(this));
      $contacts.on('click', 'a.edit', this.edit.bind(this));
      $contacts.on('click', 'a.delete', this.delete.bind(this));
      $search.on('keyup', this.setSearchTerm.bind(this));
      $tags.on('submit', this.createTag.bind(this));
      $tagList.on('click', 'a.tag-name', this.setTagFilter.bind(this));
      $tagList.on('click', 'a.remove-tag', this.removeTag.bind(this));
      $(window).on('unload', this.save.bind(this));
    },

    init: function() {
      this.cacheTemplates();
      this.loadStorage();
      this.bindEvents();
    }
  };

  contactManager.init();
});