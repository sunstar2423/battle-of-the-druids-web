# Contributing to Titanblade Games

Thank you for your interest in contributing to Titanblade Games! We welcome contributions from the community to help improve our games and make them even better.

## 🎮 About Our Games

Titanblade Games develops browser-based RPG games including:
- **Battle of the Druids** - Turn-based RPG with character classes and magical combat
- **Isle of Adventure** - Point-and-click adventure game with puzzle-solving
- **Doom Riders** - Action-adventure game (in development)

## 🤝 How to Contribute

### Ways You Can Help

- 🐛 **Report bugs** using our bug report template
- 💡 **Suggest features** using our feature request template  
- 🎨 **Improve graphics** - Create or enhance game assets
- 🔊 **Add audio** - Contribute music or sound effects
- 💻 **Code improvements** - Fix bugs or add features
- 📝 **Documentation** - Improve guides and tutorials
- 🎮 **Game testing** - Play and provide feedback
- 🌍 **Translations** - Help localize games for different languages

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/sunstar2423/titanblade-games.git
   cd titanblade-games
   ```

2. **Set up development environment**
   ```bash
   # For web games - start local server
   python3 -m http.server 8000
   # or
   npx serve .
   
   # For Python version
   pip install pygame>=2.0.0
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make your changes**
   - Follow our coding standards
   - Test your changes thoroughly
   - Update documentation if needed

5. **Submit a pull request**
   - Use descriptive commit messages
   - Reference related issues
   - Include screenshots for visual changes

## 📋 Development Guidelines

### Code Standards

**JavaScript (Web Games)**
- Use ES6+ features where supported
- Follow consistent indentation (2 spaces)
- Use meaningful variable and function names
- Comment complex game logic
- Maintain Phaser.js best practices

**Python (Original Version)**
- Follow PEP 8 style guidelines
- Use type hints where appropriate
- Write docstrings for functions and classes
- Maintain Pygame best practices

### Game Design Principles

- **Accessibility** - Games should be playable by users with disabilities
- **Performance** - Optimize for smooth gameplay across devices
- **Mobile-friendly** - Ensure games work well on touch devices
- **Browser compatibility** - Test across major browsers
- **Progressive enhancement** - Graceful degradation for older browsers

### Asset Guidelines

**Images**
- Use PNG format for game sprites
- Maintain consistent 120x120px size for character images
- Optimize file sizes without losing quality
- Include alt text descriptions

**Audio**
- Use WAV format for sound effects
- MP3 for background music
- Keep file sizes reasonable for web loading
- Ensure audio works across browsers

## 🧪 Testing

### Manual Testing
- Test in multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on mobile devices
- Verify game mechanics work correctly
- Check for performance issues

### Automated Testing
Our CI/CD pipeline automatically:
- Runs linting on JavaScript and Python code
- Validates HTML structure
- Tests game startup and basic functionality
- Performs security scans

## 📝 Pull Request Process

1. **Before submitting:**
   - Ensure CI tests pass
   - Test manually in multiple browsers
   - Update documentation if needed
   - Add screenshots for visual changes

2. **Pull request template:**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing
   - [ ] Tested locally
   - [ ] Tested in multiple browsers
   - [ ] Mobile testing completed

   ## Screenshots
   (If applicable)
   ```

3. **Review process:**
   - Maintainers will review your PR
   - Address any feedback
   - Once approved, your PR will be merged

## 🏷️ Issue Labels

We use the following labels to categorize issues:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to docs
- `good-first-issue` - Good for newcomers
- `help-wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - This will not be worked on

## 🎯 Feature Requests

When suggesting new features:

1. **Check existing issues** - Avoid duplicates
2. **Use the feature request template**
3. **Provide detailed descriptions**
4. **Consider implementation complexity**
5. **Think about user impact**

### Priority Levels
- **Critical** - Essential for accessibility or major bugs
- **High** - Important features that enhance gameplay
- **Medium** - Nice-to-have improvements
- **Low** - Minor enhancements or convenience features

## 🐛 Bug Reports

Good bug reports help us fix issues quickly:

1. **Use the bug report template**
2. **Provide clear reproduction steps**
3. **Include screenshots/videos if helpful**
4. **Specify browser/device information**
5. **Check if issue exists in latest version**

## 💡 Questions and Support

- **GitHub Discussions** - General questions and community chat
- **Issues** - Bug reports and feature requests only
- **Email** - For sensitive security issues

## 📄 License

By contributing to Titanblade Games, you agree that your contributions will be licensed under the same license as the project (see LICENSE file).

## 🙏 Recognition

Contributors are recognized in several ways:
- Listed in README acknowledgments
- Featured in release notes for significant contributions
- Special thanks in game credits
- Priority support for future contributions

## 🔐 Security

If you discover a security vulnerability, please follow our security policy (see SECURITY.md) and report it privately rather than through public issues.

---

**Thank you for contributing to Titanblade Games!** 

Your contributions help make our games better for everyone. Whether you're fixing a typo, adding a feature, or reporting a bug, every contribution matters.

Happy coding! 🎮✨